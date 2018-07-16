/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const mapperfile = './continent.json';
const outputFile = './output/output.json';
// Read asynchronously
const readFilePromise = function promiseFunction(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
// Write  file asynchronously
function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (error) => {
      if (error === null) {
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
}
// Aggregate Promise
const aggregate = filePath => new Promise((resolve, reject) => {
  Promise.all([readFilePromise(filePath), readFilePromise(mapperfile)]).then((values) => {
    const csvData = values[0]; // has the csv file
    const mapperData = JSON.parse(values[1]); // has the json file
    const Data = csvData.replace(/["]+/g, '').split('\n');
    const header = Data.shift().split(',');
    const countryIndex = header.indexOf('Country Name');
    const gdp2012Index = header.indexOf('GDP Billions (US Dollar) - 2012');
    const pop2012Index = header.indexOf('Population (Millions) - 2012');
    const continent = {};
    Data.forEach((row) => {
      const val = row.split(',');
      if (mapperData[val[countryIndex]] !== undefined) {
        const contName = mapperData[val[countryIndex]];
        if (continent[contName] === undefined) {
          continent[contName] = {};
          continent[contName].GDP_2012 = parseFloat(val[gdp2012Index]);
          continent[contName].POPULATION_2012 = parseFloat(val[pop2012Index]);
        } else {
          continent[contName].GDP_2012 += parseFloat(val[gdp2012Index]);
          continent[contName].POPULATION_2012 += parseFloat(val[pop2012Index]);
        }
      }
    });
    writeFile(outputFile, JSON.stringify(continent)).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  }).catch((error) => {
    reject(error);
  });
});
aggregate('./data/datafile.csv');
module.exports = aggregate;
