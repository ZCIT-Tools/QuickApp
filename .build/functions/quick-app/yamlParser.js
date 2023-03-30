const yaml = require('js-yaml');
const fs = require('fs');

exports.parseYaml = (file) => {
  const stream = fs.createReadStream(file.filepath);

  stream.on("data", (data) => {
    try {
      return yaml.load(data);
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  });

  stream.on("error", (err) => {
    console.error(err);
    throw err;
  });
};
