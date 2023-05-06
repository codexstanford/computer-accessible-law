const fs = require('fs');

if (!fs.existsSync(`${__dirname}/raw`)) { 
  fs.mkdirSync(`${__dirname}/raw`);
}

async function getCode(Code) {
  if (!fs.existsSync(`${__dirname}/raw/${Code}`)) { 
    fs.mkdirSync(`${__dirname}/raw/${Code}`);
  }
  console.log(`Getting ${Code}...`);
  const url = `https://leginfo.legislature.ca.gov/faces/codedisplayexpand.xhtml?tocCode=${Code}`
  const response = await fetch(url)
  const html = await response.text()
  //console.log(html)
  let links = html.match(/\/faces\/codes_displayText.xhtml\?([A-Za-z1-9=&;\.,]*)"/g);
  console.log(links);
  for (let [index, link] of links.entries()) {
    console.log(`Getting (${index + 1} / ${links.length}) ${link}...`);

    let target = `https://leginfo.legislature.ca.gov${link.replace(/"/g, '')}`;
    let tresponse = await fetch(target);
    let thead = await tresponse.text();
    thead = thead.substring(thead.indexOf('<BODY>'), thead.indexOf('</BODY>') + 7);
    fs.writeFileSync(`${__dirname}/raw/${Code}/${index}.html`, thead);     
  }
  
}

let codes = ['CONS', 'BPC', 'CIV', 'CCP', 'COM', 'CORP', 'EDC', 'ELEC', 'EVID', 'FAM', 'FIN', 'FGC', 'FAC', 'GOV', 'HNC', 'HSC', 'INS', 'LAB', 'MVC', 'PEN', 'PROB', 'PCC', 'PRC', 'PUC', 'RTC', 'SHC', 'UIC', 'VEH', 'WAT', 'WIC'];

async function main() {
  for(let code of codes) {
    await getCode(code);
  }
}

main();