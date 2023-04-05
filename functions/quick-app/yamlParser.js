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

const createRandomUser = async () => {
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();
  const state = faker.address.cityByState();
  return {
    avatar: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    email: faker.internet.email(firstName, lastName),
    firstName,
    lastName,
    sex,
    street: faker.address.streetAddress(),
    city: faker.address.cityName(),
    state: faker.address.stateAbbr(),
    zipCode: faker.address.zipCodeByState(state),
  }
}

exports.parseYaml = async (file) => {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(file);
    let wb = new excel.Workbook();

    stream.on("data", async (data) => {
      let contents = await yaml.load(data);
      const forms = Object.keys(contents); // extract forms
      let vals; // hold field vals

      forms.forEach((form) => {
        let ws = wb.addWorksheet(form); // make sheet for each form
        let fields = Object.keys(contents[form]); // extract fields
        let headers = fields.reduce((acc, field) => { // create sheet header
          // handle composite name field
          if (form.toLowerCase() === '_name') {
            vals['name'] = contents[form][field];
            acc.push('first_name');
            acc.push('last_name');
          }
          // handle composite address field
          if (form.toLowerCase() === '_address') {
            vals['address'] = contents[form][field];
            acc.push('address_1');
            acc.push('address_2');
            acc.push('state');
            acc.push('zipcode');
            acc.push('country');
          }
          else {
            // note headers are lowercased
            vals[field.toLowerCase()] = contents[form][field];
            acc.push(field.toLowerCase());
          }
          return acc;
        }, []);
        // set ws headers
        ws.columns = headers.map((h) => {
          return { header: h, key: h };
        });
        ws.commit();
      });

      // data generation from field values
      wb.eachSheet((ws) => {
        let form = ws.name; // form name
        let fields = ws.columns.map((col) => { // fields from headers
          return col._key;
        });

        fields.forEach((field) => {
          let col = 2;
          // slightly inefficient but needed to ref vals in yaml
          // since we are using the headers and not the original values
          let oldField = field;
          if (field === 'first_name' || field === 'last_name') {
            oldField = 'name';
          }
          if (contains(['address_1', 'address_2', 'city', 'state', 'zipcode'], field)) {
            oldField = 'address';
          }

          let val = vals[oldField];
          if (val.charAt(0) === '^' && ws.getRow(2).getCell(field).value === null) {
            let count = Number(val.slice(1, val.length));
            let randomUsers = range(count).map(() => {
              return createRandomUser();
            });
            randomUsers.forEach((user) => {
              ws.insertRow(2, user); // can insert user data in parallel
            });
          }
          else {
            val.split("__").forEach((v) => {
              let row = ws.getRow(col);
              row.getCell(field).value = v;
              col++;
            });
          }
        });
        ws.commit();
      });

      wb.commit();
      resolve(wb);
    });
    stream.on("error", reject);
  });
};
