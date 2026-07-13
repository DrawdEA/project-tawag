const MAX_FIELD_LENGTHS = {
  name: 80,
  contact: 120,
  comment: 1000,
};

const trimField = (value, maxLength) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const parseBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
};

const createReferenceId = () =>
  `TAWAG-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

const getFirstName = (name) => name.split(/\s+/)[0] || "friend";

module.exports = async function pledgeHandler(request, response) {
  response.setHeader("Content-Type", "application/json");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      ok: false,
      error: "Method not allowed.",
    });
  }

  const body = parseBody(request.body);
  const submission = {
    referenceId: createReferenceId(),
    submittedAt: new Date().toISOString(),
    name: trimField(body.name, MAX_FIELD_LENGTHS.name),
    contact: trimField(body.contact, MAX_FIELD_LENGTHS.contact),
    comment: trimField(body.comment, MAX_FIELD_LENGTHS.comment),
    support: body.support === true || body.support === "on",
    anonymous: body.anonymous === true || body.anonymous === "on",
  };

  if (!submission.comment) {
    return response.status(400).json({
      ok: false,
      error: "Please add a short comment before signing.",
    });
  }

  if (!submission.support) {
    return response.status(400).json({
      ok: false,
      error: "Please confirm that you support fair workload reviews.",
    });
  }

  console.info("project_tawag_pledge_submission", JSON.stringify(submission));

  return response.status(201).json({
    ok: true,
    referenceId: submission.referenceId,
    message: `Thank you for signing the pledge, ${getFirstName(submission.name)}.`,
  });
};
