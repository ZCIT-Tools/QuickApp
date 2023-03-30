const yaml = require('js-yaml');
const fs = require('fs');

exports.parseYaml = async (file) => {
  let stream = fs.createReadStream(file);

  return new Promise((resolve, reject) => {
    stream.on("data", async (data) => {
      let contents = yaml.load(data);
      resolve(contents);
    });

    stream.on("error", reject);
  });
};
