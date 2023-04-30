// Status
// https://www.akleg.gov/basis/statutes.asp?media=print&secStart=10&secEnd=10


const fs = require('fs');

async function main() {

    let resp = await fetch(`https://ltgov.alaska.gov/information/alaskas-constitution/`);
    // log response header
    console.log(resp.headers);
    // get a buffer of the response
    let buffer = await resp.arrayBuffer();

    // convert the buffer from iso-8859-1 to utf8
    let text = new TextDecoder("iso-8859-1").decode(buffer);
    


    fs.writeFileSync(`./raw/constitution.html`, text, 'utf8');
  
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