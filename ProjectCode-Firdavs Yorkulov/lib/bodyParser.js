const bodyParser = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let jsonData = "";
      req.on("data", (chunk) => {
        jsonData = chunk.toString();
      });

      req.on("end", () => {
        if (jsonData) {
          resolve(JSON.parse(jsonData));
        } else {
          reject(false);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = bodyParser;
