const { createBlobPledgeStore } = require("./pledge-store.js");

const createPledgesHandler = ({ store = createBlobPledgeStore() } = {}) => async (
  request,
  response
) => {
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({
      ok: false,
      error: "Method not allowed.",
    });
  }

  const pledges = await store.listPledges();

  return response.status(200).json({
    ok: true,
    pledges,
  });
};

const pledgesHandler = createPledgesHandler();

module.exports = pledgesHandler;
module.exports.createPledgesHandler = createPledgesHandler;
