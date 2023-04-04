const yaml = require('js-yaml');
let fs = require('fs');
let excel = require('exceljs');
const { faker } = require('@faker-js/faker/locale/en_US');

const range = (n) => {
  return Array.from(Array(n).keys());
}

createRandomUser = async () => {
    const sex = faker.name.sexType();
    const firstName = faker.name.firstName(sex);
    const lastName = faker.name.lastName();
    const countryCode = 'US';
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
      Object.keys(contents).forEach((form) => {
        let worksheet = workbook.addWorksheet(form);
        let col = 1;
        let count = 0;
        let firstMock = true;
        let mockUsersData;

        let headers = Object.keys(forms[form]).reduce((acc, field) => {
          if (form.toLowerCase() === '_name') {
            acc.push('first_name');
            acc.push('last_name');
          } else if (form.toLowerCase() === '_address') {
            acc.push('address_1');
            acc.push('address_2');
            acc.push('state');
            acc.push('zipcode');
          } else {
            acc.push(field.toLowerCase());
            let val = forms[form][field];
            if (val.charAt(0) === '^') {
              if (firstMock) {
                // No need to do this for subsequent fakes
                count = Number(val.slice(1, val.length - 1));
                firstMock = false;
                mockUsersData = range(count).map(() => {
                  return createRandomUser();
                });
              }
              if (form.toLowerCase() === '_name') {
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.firstName;
                }));
                col++;
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.lastName;
                }));
                col++;
              }
              if (form.toLowerCase() === '_address') {
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.street;
                }));
                col++;
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.city;
                }));
                col++;
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.state;
                }));
                col++;
                worksheet.addColumn(col, mockUsersData.map((user) => {
                  return user.zipCode;
                }));
                col++;
              }
            }
            else {
              worksheet.addColumn(col, forms[form][field].split('__'));
            }
          }
          return acc;
        }, []);
        col = 0;
      });
      resolve(workbook);
    });
    stream.on("error", reject);
  });
};
