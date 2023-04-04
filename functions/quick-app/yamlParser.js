const yaml = require('js-yaml');
let fs = require('fs');
let excel = require('exceljs');
let { createRandomUser, createRandomAddress } = require('./fakerFuncs');

exports.parseYaml = async (file) => {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(file);
    let workbook = new excel.Workbook();

    stream.on("data", async (data) => {
      let contents = await yaml.load(data);
      Object.keys(contents).forEach((form) => {
        let worksheet = workbook.addWorksheet(form);
        let col = 1;
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
              let count = Number(val.slice(1, val.length - 1));
              if (form.val)

            }
            else {
              worksheet.addColumn(col, forms[form][field].split('__'));
            }
          }
          return acc;
        }, []);

        // worksheet.columns = headers.map((header) => {
        //   return { header: header, id: header };
        // });

        // worksheet.addRow(1, headers.reduce((acc, header) => {
        //   acc[header] = header;
        //   return acc;
        // }, {})).commit();

      });
      resolve(workbook);
    });
    stream.on("error", reject);
  });
};
