const yaml = require('js-yaml');
const fs = require('fs');
const excel = require('exceljs');
const { faker } = require('@faker-js/faker/locale/en_US');

const range = (n) => {
  return Array.from(Array(n).keys());
}

const contains = (arr, target) => {
  return arr.reduce((acc, value) => { return acc || (target === value); }, false);
}

const createRandomUser = () => {
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();
  const state = faker.address.state();
  return {
    avatar: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    email: faker.internet.email(firstName, lastName, 'zylker.com'),
    first_name: firstName,
    last_name: lastName,
    sex: sex,
    address_1: faker.address.streetAddress(),
    city: faker.address.cityName(),
    state: faker.address.stateAbbr(),
    zipcode: faker.address.zipCodeByState(state),
    country: 'US'
  };
}

exports.parseYaml = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    const wb = new excel.Workbook();

    stream.on("data", async (data) => {
      const contents = await yaml.load(data);
      const forms = Object.keys(contents); // extract forms
      const vals = {}; // hold field vals

      forms.forEach((form) => {
        // lowercase forms
        let wsName = form.toLowerCase();
        let ws = wb.addWorksheet(wsName); // make sheet for each form
        let fields = Object.keys(contents[form]); // extract fields
        vals[wsName] = {};
        let headers = fields.reduce((acc, field) => { // create sheet header
          // lowercase the field
          let wsField = field.toLowerCase();
          if (wsField === '_name') {
            vals[wsName]['name'] = contents[form][field];
            acc.push('first_name');
            acc.push('last_name');
          }
          // handle composite address field
          if (wsField === '_address') {
            vals[wsName]['address'] = contents[form][field];
            acc.push('address_1');
            acc.push('address_2');
            acc.push('city');
            acc.push('state');
            acc.push('zipcode');
            acc.push('country');
          }
          if (wsField.charAt(0) !== '_'){
            // note headers are lowercased
            vals[wsName][wsField] = contents[form][field];
            acc.push(wsField);
          }
          return acc;
        }, []);
        // set ws headers
        ws.columns = headers.map((h) => {
          return { header: h, key: h };
        });
      });

      // data generation from field values
      wb.eachSheet((ws) => {
        let form = ws.name; // form name
        let fields = ws.columns.map((col) => { // fields from headers
          return col._key;
        });

        let count;
        let randSeen = false;
        fields.forEach((field) => {
          let col = 2;
          // slightly inefficient but needed to ref vals in yaml
          // since we are using the headers and not the original values
          let oldField = field;
          if (field === 'first_name' || field === 'last_name') {
            oldField = 'name';
          }
          if (contains(['address_1', 'address_2', 'city', 'state', 'zipcode', 'country'], field)) {
            oldField = 'address';
          }
          let val = vals[form][oldField];

          // handle rand
          let valPrefix = val.slice(0,1);
          if (valPrefix === '^') {
            if (randSeen) {
              return;
            }
            count = Number(val.slice(1, val.length));
            let randomUsers = range(count).map(() => {
              return createRandomUser();
            });
            randomUsers.forEach((user) => {
              ws.insertRow(2, user); // can insert user data in parallel
            });
            randSeen = true;
            return;
          }

          // handle entries
          let entries = val.split("__");
          if (entries.length > 1) {
            entries.forEach((entry) => {
              let row = ws.getRow(col);
              row.getCell(field).value = entry;
              col++;
            });
            return;
          }

          // handle lookups
          let lookups = val.split(".").map((x) => { return x.toLowerCase(); });
          if (lookups.length > 1) {
            let lookupVals = wb.getWorksheet(lookups[0]).getColumn(lookups[1]).values;
            lookupVals = lookupVals.slice(2,lookupVals.length);
            range(count).forEach(() => {
              let row = ws.getRow(col);
              let randLookup = faker.helpers.arrayElement(lookupVals);
              row.getCell(field).value = randLookup;
              col++;
            });
            return;
          }
        });
      });

      resolve(wb);
    });
    stream.on("error", reject);
  });
};
