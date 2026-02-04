const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function getUserFromReq(req){
  const h = req.headers["authorization"] || "";
  const m = /^Bearer\s+(.+)$/.exec(h);
  if (!m) return null;
  const token = m[1].trim();

  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return { role: "admin" };
  if (process.env.EDITOR_TOKEN && token === process.env.EDITOR_TOKEN) return { role: "editor" };
  return null;
}

module.exports = { getUserFromReq };
