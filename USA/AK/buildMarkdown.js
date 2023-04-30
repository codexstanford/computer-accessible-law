const fs = require('fs');
const OUT_DIR = `${__dirname}/md`;

async function buildMarkdown() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }

  const files = fs.readdirSync(`${__dirname}/raw`);
  for (let dir of files) {
    await buildATitle(dir);
  }
  
}

async function buildATitle(file) { 


  let str = fs.readFileSync(`${__dirname}/raw/${file}`, 'utf8');
  console.log("Parsing", file, "...");
  // remove the body tags
  str = str.replace(/<BODY.+?\>/g, '');
  str = str.replace(/<\/BODY>/gi, '');
  str = str.replace(/<\/font>/gi, '');
  
  // trim all lines in string
  str = str.split('\n').map(line => line.trim()).join('\n');

  // replace new line with spaces
  //str = str.replace(/\n/g, ' ');
  
  // remove the </P> tags
  str = str.replace(/<\/p>/g, '');

  // repalce the <p > tags ans their attibute with new lines
  str = str.replace(/<p.+?>/g, '\n');

  str = str.replace(/<h1>/gi, `\n# `);
  str = str.replace(/<h2>/gi, `\n## `);
  str = str.replace(/<h3>/gi, `\n### `);
  str = str.replace(/<h4>/gi, `\n#### `);
  str = str.replace(/<h5>/gi, `\n# `);
  str = str.replace(/<h6>/gi, `\n## `);
  str = str.replace(/<h7>/gi, `\n#### `);
  str = str.replace(/<h8>/gi, `\n##### `);
  str = str.replace(/<h9>/gi, `\n###### `);
  
 
  str = str.replace(/<\/h.>/gi, '\n\n');
  

  
  // remove the </div> tags
  str = str.replace(/<\/div>/gi, '');

  // repalce the <div> tags ans their attibute with new lines
  str = str.replace(/<div.+?>/gi, '\n');

    //remove a tags
    str = str.replace(/<a.+?>/gi, '');

    // remove closing a tags
  str = str.replace(/<\/a>/gi, '');


  //remove b tags
  str = str.replace(/<b>/gi, '######');

    // remove closing b tags
  str = str.replace(/<\/b>/gi, '\n\n');

  // remove br
  str = str.replace(/<br\/>/gi, '\n\n');
  str = str.replace(/<br>/gi, '\n\n');

  str = htmlTablesToMarkdown(str);

  str = resolveHTMLSepcialChar(str);
//   console.log(str);
  

  let lines = str.split('\n');

  // remove line with only # or repeated #
  let newLines = [];
  for (let line of lines) {
    if (line.trim().match(/^#+$/)) {
      //;
    }
    else {
      newLines.push(line.trim());
    }
   
  }
  str = newLines.join('\n');
  
  str = str.replace(/\n\n\n*/g, '\n\n');
  str = str.trim();

  fs.writeFileSync(`${OUT_DIR}/status/${file.replace(".html", "")}.md`, str, 'utf8');

}


function htmlTablesToMarkdown(html) {
  let markdown = html;

  // remove all \n in content between <td> and </td>

  markdown = markdown.replace(/<table>(.+?)<\/table>/gi, (match, p1) => {
    return `<table>${p1.replace(/\n/g, ' ')}</table>`;
  });
  markdown = markdown.replace(/<table.+?>(.+?)<\/table>/gi, (match, p1) => {
    return `<table>${p1.replace(/\n/g, ' ')}</table>`;
  });
  
 
  markdown = markdown.replace(/<table>/gi, '\n');
  markdown = markdown.replace(/<table.+?>/gi, '\n');
  markdown = markdown.replace(/<\/table>/gi, '');
  markdown = markdown.replace(/<tr>/gi, '\n');
  markdown = markdown.replace(/<tr.+?>/gi, '\n');
  markdown = markdown.replace(/<\/tr>/gi, '|');
  markdown = markdown.replace(/<th.+?>/gi, '\n');
  markdown = markdown.replace(/<th>/gi, '\n');
  markdown = markdown.replace(/<\/th>/gi, '|');
  markdown = markdown.replace(/<td>/gi, '|');
  markdown = markdown.replace(/<td.+?>/gi, '|');
  markdown = markdown.replace(/<\/td>/gi, '');
  return markdown;
}


function resolveHTMLSepcialChar(str) {
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#xA7;/g, '§');
  str = str.replace(/ � /g, '§');
  str = str.replace(/�/g, '"');

  // simplify with ""
  str = str.replace(/&#x201C;/g, '"');
  str = str.replace(/&#x201D;/g, '"');

  str = str.replace(/&#xFFFD;/g, '"');

  // simplify with '
  str = str.replace(/&#x2019;/g, '\'');
  str = str.replace(/&#x2018;/g, '\'');

  // simplify with -

  str = str.replace(/&#x2010;/g, '-');
  str = str.replace(/&#x2011;/g, '-');
  str = str.replace(/&#x2012;/g, '-');
  str = str.replace(/&#x2013;/g, '-');
  str = str.replace(/&#x2014;/g, '-');
  str = str.replace(/&#x2015;/g, '-');
  str = str.replace(/&#x2212;/g, '-');

  // &#x20AC;
  str = str.replace(/&#x20AC;/g, '€');

  // &#xD7;
  str = str.replace(/&#xD7;/g, 'x');

  // simplify with ...
  str = str.replace(/&#x2026;/g, '...');

  // &#x2713; used in TSA Pre ✓ 
  str = str.replace(/&#x2026;/g, '✓');
  

  // degree
  str = str.replace(/&#xBO;/g, '°');

  //&#xB5;
  str = str.replace(/&#xB5;/g, 'µ');

  // • list identation
  str = str.replace(/&#x2022;/g, '-');

  // &#xB1;
  str = str.replace(/&#xB1;/g, '+/-');

  // &#x394;
  str = str.replace(/&#x394;/g, 'Δ');
  
  // &#x3C4;
  str = str.replace(/&#x3C4;/g, 'θ');

  // &#x3C1;
  str = str.replace(/&#x3C1;/g, 'ρ');

  // &#x3C0;
  str = str.replace(/&#x3C0;/g, 'π');

  // &#x223C;
  str = str.replace(/&#x223C;/g, '∼');

  // &#x398;
  str = str.replace(/&#x398;/g, 'Θ');

  // &#x3A3;
  str = str.replace(/&#x3A3;/g, 'Σ');

  // &#x2211;
  str = str.replace(/&#x2211;/g, '∑');
  
  // &#x3BB;
  str = str.replace(/&#x3BB;/g, 'λ');

  // &#x3B4;
  str = str.replace(/&#x3B4;/g, 'δ');
  
  // &#x3B5;
  str = str.replace(/&#x3B5;/g, 'ε');

  // &#x2265;
  str = str.replace(/&#x2265;/g, '≥');

  // &#x3B8;
  str = str.replace(/&#x3B8;/g, 'θ');
  
  //  &nbsp;
  str = str.replace(/&nbsp;/g, ' ');
  return str;
}


buildMarkdown();
