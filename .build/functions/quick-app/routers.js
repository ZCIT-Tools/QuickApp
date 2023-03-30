const catalyst = require('zcatalyst-sdk-node');
const formidable = require('formidable');
const form = formidable({ multiples: true, keepExtensions: true });
const { parseYaml } = require('./yamlParser')
const { createRandomUser, createRandomAddress } = require('./fakerFuncs');

module.exports = (router) => {
  router.post('/create-schema', (req, res) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log(err);
        res.status(500).send("error parsing arguments.");
        return;
      }

      const yamlFile = files.yaml;

      try {
        const parsedFile = parseYaml(yamlFile);
        res.send(parsedFile);
      }
      catch (err) {
        console.error(err);
        res.status(500).send("error parsing file");
      }
    });
  });

  router.get('/get-schema', (req, res) => {
    res.send({ "message": "placeholder" });
  });
}
