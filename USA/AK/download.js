// Status
// https://www.akleg.gov/basis/statutes.asp?media=print&secStart=10&secEnd=10


const fs = require('fs');

async function main() {
  for (let i = 1; i < 48; i++) {
    console.log('Downloading alaska title', i, '...')
    let resp = await fetch(`https://www.akleg.gov/basis/statutes.asp?media=print&secStart=${i}.0&secEnd=${i}`);
    // log response header
    console.log(resp.headers);
    // get a buffer of the response
    let buffer = await resp.arrayBuffer();

    // convert the buffer from iso-8859-1 to utf8
    let text = new TextDecoder("iso-8859-1").decode(buffer);
    


    fs.writeFileSync(`./raw/title-${i}.html`, text, 'utf8');
  }
}

// list all possible text encoders


const hasFullICU = (() => {
  try {
    const january = new Date(9e8);
    const spanish = new Intl.DateTimeFormat('es', { month: 'long' });
    return spanish.format(january) === 'enero';
  } catch (err) {
    return false;
  }
})(); 

console.log("ICU:", hasFullICU);
if (!hasFullICU) {
  console.log("WARNING: ICU is not supported. This may cause problems with text encoding.");
}
main();