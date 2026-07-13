const test = require("node:test");
const assert = require("node:assert/strict");

const { createPledgesHandler } = require("../api/pledges.js");

const createResponse = () => {
  const response = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("returns public pledge wall entries", async () => {
  const store = {
    async listPledges() {
      return [
        {
          referenceId: "TAWAG-123",
          submittedAt: "2026-07-13T04:00:00.000Z",
          displayName: "Anonymous supporter",
          comment: "Fair work needs fair scope.",
          anonymous: true,
        },
      ];
    },
  };
  const response = createResponse();
  const handler = createPledgesHandler({ store });

  await handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.pledges.length, 1);
  assert.equal(response.body.pledges[0].comment, "Fair work needs fair scope.");
});

test("rejects unsupported pledge wall methods", async () => {
  const response = createResponse();
  const handler = createPledgesHandler({
    store: {
      async listPledges() {
        return [];
      },
    },
  });

  await handler({ method: "POST" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Method not allowed.");
});
