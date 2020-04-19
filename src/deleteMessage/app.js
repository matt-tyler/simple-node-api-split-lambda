const DynamoDB = require("aws-sdk/clients/dynamoDB");

async function deleteMessage(client, { id: sk, author: pk }) {
  await client.delete({ Key: { pk, sk } }).promise();
}

const lambdaHandler = async ({ queryStringParameters: { id, author } }) => {
  const client = new DynamoDB.DocumentClient({
    params: {
      TableName: process.env["TABLE_NAME"] || "default"
    }
  });
  await deleteMessage(client, { id, author });
  return {};
};

module.exports = { lambdaHandler, deleteMessage };
