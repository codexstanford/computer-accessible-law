const cheerio = require('cheerio');

async function getCode() {
 // https://www.codepublishing.com/CA/MenloPark/ 
  const url = 'https://www.codepublishing.com/CA/MenloPark/';
  // fetch
  const response = await fetch(url);
  const html = await response.text();

  // get title list
  const $ = cheerio.load(html);

  const a = $('a');

  for (let i = 0; i < a.length; i++) {
    // print href
    const href = a[i].attribs.href;
    console.log(href);



  }
}

getCode();