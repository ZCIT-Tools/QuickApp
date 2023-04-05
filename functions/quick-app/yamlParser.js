const yaml = require('js-yaml');
let fs = require('fs');
let excel = require('exceljs');
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
    let workbook = new excel.Workbook();

    stream.on("data", async (data) => {
      let contents = await yaml.load(data);
      const forms = Object.keys(contents);
      // Generate sheets and headers
      forms.forEach((form) => {
        let worksheet = workbook.addWorksheet(form);
        let fields = Object.keys(contents[form]);
        // Ideally fields would be enough but Name and Address fields are composite
        let headers = fields.reduce((acc, field) => {
          if (form.toLowerCase() === '_name') {
            acc.push('first_name');
            acc.push('last_name');
          }
          if (form.toLowerCase() === '_address') {
            acc.push('address_1');
            acc.push('address_2');
            acc.push('state');
            acc.push('zipcode');
            acc.push('country');
          }
          else {
            acc.push(field.toLowerCase());
          }
        }, []);
        // Set column keys
        worksheet.columns = headers.map((h) => {
          return { header: h, key: h };
        }).commit();
      });

      // Generate data
      workbook.eachSheet((sheet) => {
        let form = sheet.name;
        let fields = sheet.columns.map((col) => { return col._key; });
        fields.forEach((field) => {
          let col = 2;
          // Ugly hack because composite fields; may refactor later
          if (field === 'first_name' || field === 'last_name') {
            let oldField = '_Name';
          }
          if (contains(['address_1', 'address_2', 'city', 'state', 'zipcode'], field)) {
            let oldField = '_Address';
          }

          let vals = contents[form][oldField];
          if (vals.charAt(0) === '^'
              && sheet.getRow(2).getCell(field).value === null) {
            let count = Number(vals.slice(1, vals.length));
            let randomUsers = range(count).map(() => {
              return createRandomUser();
            });

            randomUsers.forEach((user) => {
              sheet.insertRow(2, user);
            });
          }
          else {
            vals.split("__").forEach((val) => {
              let row = sheet.getRow(col);
              row.getCell(field).value = val;
              col++;
            });
          }
        });
      });
      resolve(workbook);
    });
    stream.on("error", reject);
  });
};
