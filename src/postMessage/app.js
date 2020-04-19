const DynamoDB = require("aws-sdk/clients/dynamodb");
const { ulid } = require("ulid");
const { Model } = require("dynamodb-toolbox");

const PostModel = new Model("PostModel", {
  table: process.env["TABLE_NAME"] || "default",
  partitionKey: "pk",
  sortKey: "sk",
  schema: {
    pk: { type: "string", alias: "author" },
    sk: { type: "string", alias: "id" },
    ms: { type: "string", alias: "message" },
    ts: { type: "number", alias: "time" },
    ty: { type: "string", default: "comment" }
  }
});

function getSubClaimFromHeader(auth) {
  const base64token = auth.slice("Bearer ".length).split(".")[1];
  const tokenString = Buffer.from(base64token, "base64").toString("utf8");
  const { sub } = JSON.parse(tokenString);
  return sub;
}

const postMessage = async (client, { author, time, message }) => {
  const id = ulid(time);
  const item = { id, author, time, message };
  const params = PostModel.put(item);
  await client.put(params).promise();
  return item;
};

const lambdaHandler = async ({
  requestContext: { timeEpoch: time },
  headers: { authorization },
  body: message
}) => {
  const client = new DynamoDB.DocumentClient();
  const author = getSubClaimFromHeader(authorization);
  return await postMessage(client, { author, message, time });
};

module.exports = { lambdaHandler, postMessage };
