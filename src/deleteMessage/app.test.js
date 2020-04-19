const { deleteMessage } = require("./app");
const sinon = require("sinon");
const chai = require("chai");
const { ulid } = require("ulid");
chai.use(require("sinon-chai"));
chai.use(require("chai-things"));

const expect = chai.expect;

describe("Given the something", () => {
  const client = {
    delete: sinon.fake.returns({
      promise: () => Promise.resolve()
    })
  };

  afterEach(() => {
    sinon.reset();
  });

  describe("When I delete a message", () => {
    const params = { id: ulid(), author: "Doug" };

    const WhenIDeleteAMessage = () => deleteMessage(client, params);

    it("Then it should have called dynamo to delete the message", () =>
      WhenIDeleteAMessage().then(() => {
        expect(client.delete).to.have.callCount(1);
      }));
  });
});
