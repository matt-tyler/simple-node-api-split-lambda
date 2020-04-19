const { postMessage } = require("./app");
const sinon = require("sinon");
const chai = require("chai");
chai.use(require("sinon-chai"));
chai.use(require("chai-things"));

const expect = chai.expect;

describe("Given the something", () => {
  const client = {
    put: sinon.fake.returns({
      promise: () => Promise.resolve()
    })
  };

  afterEach(() => {
    sinon.reset();
  });

  describe("When I post messages", () => {
    const messages = ["Alan", "Betty", "Carl"].map(author => ({
      message: `message from ${author}`,
      time: new Date().getTime(),
      author
    }));

    const WhenIPostMessages = () =>
      Promise.all(messages.map(m => postMessage(client, m)));

    it("Then messages should be returned with an ID", () =>
      WhenIPostMessages().then(messages => {
        expect(messages).to.all.have.property("id");
      }));

    it("Then it should have called dynamo to store the message", () =>
      WhenIPostMessages().then(() => {
        expect(client.put).to.have.callCount(3);
      }));
  });
});
