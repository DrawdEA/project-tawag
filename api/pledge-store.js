const PLEDGES_PATH = "pledges/wall.json";
const MAX_PLEDGES = 100;

const streamToText = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
};

const readPledges = async (blobClient) => {
  const result = await blobClient.get(PLEDGES_PATH, {
    access: "private",
    useCache: false,
  });

  if (!result) {
    return [];
  }

  const text = await streamToText(result.stream);
  const parsed = JSON.parse(text);

  return Array.isArray(parsed.pledges) ? parsed.pledges : [];
};

const writePledges = async (blobClient, pledges) => {
  await blobClient.put(
    PLEDGES_PATH,
    JSON.stringify({ pledges }, null, 2),
    {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    }
  );
};

const createBlobPledgeStore = (blobClient = require("@vercel/blob")) => ({
  async listPledges() {
    try {
      return await readPledges(blobClient);
    } catch (error) {
      if (error && error.name === "BlobNotFoundError") {
        return [];
      }

      throw error;
    }
  },

  async savePledge(pledge) {
    const currentPledges = await this.listPledges();
    const nextPledges = [pledge, ...currentPledges].slice(0, MAX_PLEDGES);

    await writePledges(blobClient, nextPledges);

    return pledge;
  },
});

module.exports = {
  createBlobPledgeStore,
};
