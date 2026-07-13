const test = require("node:test");
const assert = require("node:assert/strict");

const pledgeHandler = require("../api/pledge.js");

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

const callHandler = async (request) => {
  const response = createResponse();
  await pledgeHandler(request, response);
  return response;
};

test("accepts a pledge with a required comment", async () => {
  const response = await callHandler({
    method: "POST",
    body: {
      name: "Eddy",
      contact: "C1",
      comment: "Entry-level work should come with fair pay and clear scope.",
      support: true,
      anonymous: false,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.ok, true);
  assert.match(response.body.referenceId, /^TAWAG-/);
  assert.equal(response.body.message, "Thank you for signing the pledge, Eddy.");
});

test("rejects pledge submissions without a comment", async () => {
  const response = await callHandler({
    method: "POST",
    body: {
      name: "Eddy",
      contact: "C1",
      comment: "   ",
      support: true,
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Please add a short comment before signing.");
});

test("rejects unsupported methods", async () => {
  const response = await callHandler({ method: "GET", body: {} });

  assert.equal(response.statusCode, 405);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Method not allowed.");
});
