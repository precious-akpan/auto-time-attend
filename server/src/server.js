const app = require("./app")
const https = require("https");
const { mongoConnect} = require("../services/mongo");
const {readFileSync} = require("fs");
require('dotenv').config()

const server = https.createServer({
    key: readFileSync('key.pem'),
    cert: readFileSync('cert.pem')
}, app);
const PORT = process.env.PORT;

async function startServer() {
  await mongoConnect();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
