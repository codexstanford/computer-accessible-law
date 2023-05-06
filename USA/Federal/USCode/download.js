const fs = require('fs');
const execSync = require('child_process').execSync;

if (!fs.existsSync(`${__dirname}/raw`)) { 
  fs.mkdirSync(`${__dirname}/raw`);
}

execSync('curl https://uscode.house.gov/download/releasepoints/us/pl/118/3not328/xml_uscAll@118-3not328.zip -o raw/data.zip');

execSync('unzip raw/data.zip -d raw');

