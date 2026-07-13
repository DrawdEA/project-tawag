const test = require("node:test");
const assert = require("node:assert/strict");

const { createPledgeHandler } = require("../api/pledge.js");

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

const createStore = () => {
  const store = {
    saved: [],
    async savePledge(pledge) {
      this.saved.push(pledge);
      return pledge;
    },
  };

  return store;
};

const callHandler = async (request, store = createStore()) => {
  const response = createResponse();
  const pledgeHandler = createPledgeHandler({ store });
  await pledgeHandler(request, response);
  return { response, store };
};

test("accepts a pledge with a required comment", async () => {
  const { response, store } = await callHandler({
    method: "POST",
    body: {
      name: "Eddy",
      contact: "C1",
      comment: "Entry-level work should come with fair pay and clear scope.",
      support: true,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.ok, true);
  assert.match(response.body.referenceId, /^TAWAG-/);
  assert.equal(response.body.message, "Thank you for signing the pledge, Eddy.");
  assert.equal(store.saved.length, 1);
  assert.equal(store.saved[0].displayName, "Eddy");
  assert.equal(store.saved[0].comment, "Entry-level work should come with fair pay and clear scope.");
  assert.equal(store.saved[0].contact, undefined);
});

test("ignores legacy anonymous requests and shows the signer name", async () => {
  const { response, store } = await callHandler({
    method: "POST",
    body: {
      name: "JJ",
      contact: "C1",
      comment: "Fair work needs fair scope.",
      support: true,
      anonymous: true,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(store.saved.length, 1);
  assert.equal(store.saved[0].displayName, "JJ");
  assert.equal(store.saved[0].anonymous, undefined);
});

test("rejects pledge submissions without a comment", async () => {
  const { response, store } = await callHandler({
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
  assert.equal(response.body.error, "Please add feedback or a reason before signing.");
  assert.equal(store.saved.length, 0);
});

test("rejects unsupported methods", async () => {
  const { response } = await callHandler({ method: "GET", body: {} });

  assert.equal(response.statusCode, 405);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Method not allowed.");
});
