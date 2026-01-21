const NodeCache = require("node-cache");
// 5 minutes default TTL, check for expired keys every 5.3 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });
module.exports = cache;
