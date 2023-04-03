const yaml = require('js-yaml');
const fs = require('fs');
const xlsx = require('exceljs');
const { createRandomUser, createRandomAddress } = require('./fakerFuncs');

exports.parseYaml = async (file) => {
  const stream = fs.createReadStream(file);
  const workbook = new xlsx.Workbook();
  workbook.creator = 'QuickApp';
  workbook.created = new Date();

  return new Promise((resolve, reject) => {
    stream.on("data", async (data) => {
      let contents = await yaml.load(data);
      let forms = contents.Forms;

      ////////////////////////////////////////////////////////////////////
      // const xlsx = require('exceljs');
      // const forms = {"forms": { "department": { "name": "string",
      //                                            "code": "string" },
      //                           "role": { "name": "string",
      //                                     "description": "string" },
      //                           "person": { "name": "name",
      //                                       "email": "email",
      //                                       "address": "address",
      //                                       "department": "department",
      //                                       "role": "role" }
      //                         }
      //               }.forms;
      // const workbook = new xlsx.Workbook();
      ////////////////////////////////////////////////////////////////////

      Object.keys(forms).forEach((form) => {
        let worksheet = workbook.addWorksheet(form);
        let headers = Object.keys(forms[form]).reduce((acc, field) => {
          if (forms[form][field].toLowerCase() === 'name') {
            acc.push('first_name');
            acc.push('last_name');
          } else if (forms[form][field].toLowerCase() === 'address') {
            acc.push('address_1');
            acc.push('address_2');
            acc.push('state');
            acc.push('zipcode');
          } else {
            acc.push(field.toLowerCase());
          }
          return acc;
        }, []);

        worksheet.columns = headers.map((header) => {
          return { header: header, id: header };
        });

        worksheet.addRow(1, headers.reduce((acc, header) => {
          acc[header] = header;
          return acc;
        }, {})).commit();
      });

      workbook.xlsx.writeFile('./file.xlsx');

      resolve(workbook);
    });
    stream.on("error", reject);
  });
};
