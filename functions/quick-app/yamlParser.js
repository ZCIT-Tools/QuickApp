const yaml = require('js-yaml');
const fs = require('fs');
const { createRandomUser, createRandomAddress } = require('./fakerFuncs');

exports.parseYaml = async (file) => {
  let stream = fs.createReadStream(file);

  return new Promise((resolve, reject) => {
    stream.on("data", async (data) => {
      let contents = await yaml.load(data);

      contents.forEach((entry) => {

      });

      resolve(contents);
    });
    stream.on("error", reject);
  });
};
