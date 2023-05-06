const fs = require('fs');

let files = fs.readdirSync('./raw/constitution');

let md = "# Constitution Of The State of Arizona\n\n"

// sort by article number
files.sort((a, b) => {
  return parseInt(a) < parseInt(b) ? -1 : 1;
})

for (let file of files) { 
  if (file.indexOf('.json') == -1) {
    continue;
  }
  let json = JSON.parse(fs.readFileSync(`./raw/constitution/${file}`, 'utf8'));
  md += `## Article ${json.article} - ${json.name}\n\n`;

  if (!json.children) { 
    console.log(file, "do not contain children")
    continue;
  }
  for (let section of json.children) {
    md += renderSection(section, json.article);
  }

}


// trim all lines of md
md = md.split('\n').map(line => line.trim()).join('\n');

md = md.replace(/\n\n*/g, '\n\n');

fs.writeFileSync('./md/constitution.md', resolveHTMLSepcialChar(md), 'utf8');

function renderSection(section, id) {
  let md = '### Section ';

  // <title></title>
  let title = section.content.match(/<title>([^<]+)<\/title>/i);
  title = title[1].replace('Article ' + id, '')
 // md += `### ${title}\n\n`;
  section.content = section.content.replace(/\r\n/g, ' ').replace(/Section [0-9]*\./gi, '');
  // <P></P>
  let paragraphs = section.content.match(/<p>(.+?)<\/p>/ig);

  for (let paragraph of paragraphs) {
    md += `${paragraph.replace(/<[^>]+>/g, '')}\n\n`;
  }

  md = md.replace(/  */g, ' ');
  return md;
} 


function resolveHTMLSepcialChar(str) {

  str = str.replace(/&#x26;/g, '&');

  // &mldr;
  str = str.replace(/&mldr;/g, '...');
  
  // &nbsp;
  str = str.replace(/&nbsp;/g, ' ');
  // &sect;
  
  str = str.replace(/&sect;/g, '§');
  str = str.replace(/&#xA7;/g, '§');

  // simplify with ""
  str = str.replace(/&#x201C;/g, '"');
  str = str.replace(/&#x201D;/g, '"');

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


  //  &cent;
  str = str.replace(/&cent;/g, '¢');

  // &dollar;
  str = str.replace(/&dollar;/g, '$');
  // &#x2122;
  str = str.replace(/&#x2122;/g, '™');

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
  

  // &thinsp;
  str = str.replace(/&thinsp;/g, ' ');
  
  // &ensp;
  str = str.replace(/&ensp;/g, ' ');

  // &emsp;
  str = str.replace(/&emsp;/g, ' ');

  // &ndash;
  str = str.replace(/&ndash;/g, '-');

  // &mdash;
  str = str.replace(/&mdash;/g, '-');

  // &apos;
  str = str.replace(/&apos;/g, '\'');

  // &rdquo;
  str = str.replace(/&rdquo;/g, '"');

  // &ldquo;
  str = str.replace(/&ldquo;/g, '"');

  // &rsquo;
  str = str.replace(/&rsquo;/g, '\'');

  // &lsquo;
  str = str.replace(/&lsquo;/g, '\'');

  // &percnt;
  str = str.replace(/&percnt;/g, '%');

  // &amp;
  str = str.replace(/&amp;/g, '&');  

  // &shy;
  str = str.replace(/&shy;/g, '');

  // &deg;
  str = str.replace(/&deg;/g, '°');

  // &times;
  str = str.replace(/&times;/g, 'x');

  // &divide;
  str = str.replace(/&divide;/g, '/');

  // &hellip;
  str = str.replace(/&hellip;/g, '...');

  // &quot;
  str = str.replace(/&quot;/g, '"');

  return str;
}

