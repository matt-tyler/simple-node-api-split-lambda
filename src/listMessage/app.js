const DynamoDb = require("aws-sdk/clients/dynamodb");
const { Model } = require("dynamodb-toolbox");
const KMS = require("aws-sdk/clients/kms");

const ListModel = new Model("ListModel", {
  table: process.env["TABLE_NAME"] || "default",
  partitionKey: "pk",
  sortKey: "sk",
  schema: {
    pk: { type: "string", alias: "author" },
    sk: { type: "string", alias: "id" },
    ms: { type: "string", alias: "message" },
    ts: { type: "number", alias: "time" },
    ty: { type: "string", default: "comment", hidden: true }
  }
});

async function ListMessages(client, overrides, encrypt) {
  const defaultParams = {
    IndexName: "ty-sk",
    KeyConditionExpression: "ty = :v1",
    ExpressionAttributeValues: { ":v1": "comment" },
    ScanIndexForward: false,
    Limit: 10
  };

  console.log(overrides);
  const params = { ...defaultParams, ...overrides };
  const response = await client.query(params).promise();

  const nextToken = response.LastEvaluatedKey
    ? {
        nextToken: await encrypt(
          JSON.stringify({
            ExclusiveStartKey: response.LastEvaluatedKey,
            Limit: params.Limit
          })
        )
      }
    : {};

  return { items: ListModel.parse(response), ...nextToken };
}

async function parseQueryParameters(params, decrypt) {
  const maxItems = params.maxItems ? { Limit: params.maxItems } : {};
  const token = params.token ? JSON.parse(await decrypt(params.token)) : {};
  return { ...token, ...maxItems };
}

const key = client => ({
  encrypt: async Plaintext => {
    const { CiphertextBlob } = await client.encrypt({ Plaintext }).promise();
    return encodeURIComponent(CiphertextBlob.toString("base64"));
  },
  decrypt: async enc => {
    const CiphertextBlob = Buffer.from(enc, "base64");
    const { Plaintext } = await client.decrypt({ CiphertextBlob }).promise();
    return Plaintext;
  }
});

module.exports.lambdaHandler = async ({
  queryStringParameters: queryParams
}) => {
  const kmsClient = new KMS({
    params: {
      KeyId: process.env["KEY_ID"] || "default"
    }
  });

  const paramOverrides = await parseQueryParameters(
    queryParams || {},
    async message => await key(kmsClient).decrypt(message)
  );

  const client = new DynamoDb.DocumentClient({
    params: {
      TableName: process.env["TABLE_NAME"] || "default"
    }
  });

  return await ListMessages(
    client,
    paramOverrides,
    async message => await key(kmsClient).encrypt(message)
  );
};
