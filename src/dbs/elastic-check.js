const client = require("./elastic-client");

//check connect
client.ping(
  {
    requestTimeout: 3000, //ms
  },
  (err, res, sta) => {
    if (err) {
      return console.error(`Error connect:::`, err);
    }
    console.log(`isOkay::: connect`);
  }
);
