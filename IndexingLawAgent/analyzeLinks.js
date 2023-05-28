const fs = require('fs');

var { Extractor } = require('markdown-tables-to-json');

const countries = JSON.parse(fs.readFileSync('countries.json', 'utf-8'));

 
 // for all countries, extract the links and verify them

 for (let country of countries) {
  country = country.name;
  if (!fs.existsSync(`data/raw-${country}.md`)) { 
    continue;
  }
  const rawMd = fs.readFileSync(`data/raw-${country}.md`, 'utf-8');
  console.log(Extractor.extractObject(rawMd, 'rows', true));

}


