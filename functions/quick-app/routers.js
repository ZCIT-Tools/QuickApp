const catalyst = require('zcatalyst-sdk-node');
const formidable = require('formidable');
const form = formidable({ multiples: false, keepExtensions: false });
const { parseYaml } = require('./yamlParser')

module.exports = (router) => {
  router.post('/create-schema', async (req, res) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.status(500).send("error parsing arguments");
        return;
      }

      let file = files.yaml.filepath;

      try {
        let contents = await parseYaml(file);
        res.send(contents);
      } catch (err) {
        console.error(err);
        res.status(500).send("error parsing file");
      }
    });
  });

  router.get('/get-schema', (req, res) => {
    res.send({ "message": "placeholder" });
  });
}
