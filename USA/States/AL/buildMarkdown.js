const fs = require('fs');
const { TypeMetaFieldDef } = require('graphql');


async function buildMd() {
  let constitution = JSON.parse(fs.readFileSync(`${__dirname}/raw/constitution.json`, 'utf8'));

  let titleLvl = 1;
  let md = `# Constitution Of Alabama\n\n`;

  for (let title of constitution) { 
    md += renderMD(title, titleLvl);
  }
  
  // replace \n\n... with \n\n in md
  md = md.replace(/\n\n\n*/g, '\n\n');
  fs.writeFileSync(`${__dirname}/md/constitution.md`, md, 'utf8');

  let code = JSON.parse(fs.readFileSync(`${__dirname}/raw/code.json`, 'utf8'));

  titleLvl = 1;
  md = `# Code Of Alabama\n\n`;

  for (let title of code) { 
    md += renderMDCode(title, titleLvl);
  }
  
  // replace \n\n... with \n\n in md
  md = md.replace(/\n\n\n*/g, '\n\n');

 fs.writeFileSync(`${__dirname}/md/code.md`, md, 'utf8');
}

function renderMD(item, titleLvl) { 
  let md = '';
  if (Array.isArray(item.Html)) {
    md += `${'#'.repeat(titleLvl + 1)} ${item.Title}\n\n`;

    for (let html of item.Html) { 
      md += renderMD(html, titleLvl + 1);
    }
  }
  else {
    md += renderHTML(item.Html, titleLvl + 1, item);
  }
  return resolveHTMLSepcialChar(md);
}

function renderHTML(html, titleLvl, item) { 
  let md = `${'#'.repeat(titleLvl)} ${item.Title}\n\n`;

  titleLvl++;
  
  if (html.indexOf('<h2>') != -1) { 
    // remove all content before included </h2> in html
    html = html.substring(html.indexOf('</h2>') + 5);
  }
  md += html;

  // <u>&sect; 63&ndash;10.00</u></h4><h3>Occupational Tax Prohibited.</h3>
  md = md.replace(/<h4><u>(.+?)<\/u><\/h4> *<h3>(.+?)<\/h3>/g, `${'#'.repeat(titleLvl)} $1 $2\n\n`);
  md = md.replace(/<h4.+?><u>(.+?)<\/u><\/h4> *<h3>(.+?)<\/h3>/g, `${'#'.repeat(titleLvl)} $1 $2\n\n`);
  md = md.replace(/h4><u>(.+?)<\/u><\/h4> *<h3>(.+?)<\/h3>/g, `${'#'.repeat(titleLvl)} $1 $2\n\n`);

  md = md.replace(/<u>(.+?)<\/u><\/h4> *<h3.+?>(.+?)<\/h3>/g, `${'#'.repeat(titleLvl)} $1 $2\n\n`);
  

  md = md.replace(/<i>(.+?)<\/i>/g, `${'#'.repeat(titleLvl + 1)} $1\n\n`);


  md = md.replace(/<p.+?>/g, '');
  md = md.replace(/<\/p>/g, '\n\n');


  md = resolveHTMLSepcialChar(md);
  md += '\n\n';
  md = md.replace(/  */g, ' ');

  return md;
}

function renderMDCode(item, titleLvl) { 
  let md = '';
  if (Array.isArray(item.Html)) {
    md += `${'#'.repeat(titleLvl + 1)} ${item.Title}\n\n`;

    for (let html of item.Html) { 
      md += renderMDCode(html, titleLvl + 1);
    }
  }
  else {
    md += renderHTMLCode(item.Html, titleLvl + 1, item);
  }

  md += '\n\n';
  return resolveHTMLSepcialChar(md);
}

function renderHTMLCode(html, titleLvl, item) { 
  let md = `${'#'.repeat(titleLvl)} ${item.Title}\n\n`;

  titleLvl++;
  

  md += html;


 // md = md.replace(/<p.+?>/g, '');
  md = md.replace(/<\/p>/gi, '\n\n');

  // remove alla that is between <p><i> and <p><i>
  md = md.replace(/<p><i>.+?<p><i>/g, '');

  // remove all <p>
  md = md.replace(/<p>/gi, '');
  md = md.replace(/<p.+?>/gi, '');

  md = md.replace(/<i><\/i>/g, '');

//<i><i>
  md = md.replace(/<i><i>/g, '');

  md = md.replace(/<br>/g, '\n\n');

  md = resolveHTMLSepcialChar(md);
  md = md.replace(/  */g, ' ');

  //<ul>content</ul>
  md = md.replace(/<ul><ul>/g, '\n\n- ');
  md = md.replace(/<\/ul><ul>/g, '\n\n- ');

  md = md.replace(/<ul>/g, '');
  md = md.replace(/<\/ul>/g, '');

  // <!--?PubTbl tgroup dispwid="5.60in"-->
  md = md.replace(/<!--.+?-->/g, '');

  // <?Pub _font FamName="Lucida Sans Unicode">
  md = md.replace(/<\?Pub.+?>/g, '');
  
  // <?Pub /_font>
  md = md.replace(/<\?Pub.+?>/g, '');

  // <edit type="strike">content</edit> REMOVE
  md = md.replace(/<edit type="strike">.+?<\/edit>/g, '');

  //<edit type="underline">
  md = md.replace(/<edit.+?>/g, '');

  // </edit>
  md = md.replace(/<\/edit>/g, '');

  md = htmlTablesToMarkdown(md);

  // </HTML>
  md = md.replace(/<\/.+?>/g, '');

  // <tgroup cols=' 2' colsep='0' rowsep='0'
  md = md.replace("<tgroup cols=' 2' colsep='0' rowsep='0'", '');
  md = md.replace("type='simple'>", '');
  // <!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 3.2//EN\">
  md = md.replace(/<!DOCTYPE.+?>/g, '');

  md = md.replace(/<.+?>/g, '');
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



  return str;
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
  markdown = markdown.replace(/<row>/gi, '\n');
  markdown = markdown.replace(/<row.+?>/gi, '\n');
  
  
  markdown = markdown.replace(/<\/tr>/gi, '|');
  markdown = markdown.replace(/<\/row>/gi, '|');


  markdown = markdown.replace(/<th.+?>/gi, '\n');
  markdown = markdown.replace(/<th>/gi, '\n');
  markdown = markdown.replace(/<\/th>/gi, '|');

  markdown = markdown.replace(/<td>/gi, '|');
  markdown = markdown.replace(/<td.+?>/gi, '|');
  markdown = markdown.replace(/<entry>/gi, '|');
  markdown = markdown.replace(/<entry.+?>/gi, '|');


  markdown = markdown.replace(/<\/td>/gi, '');
  markdown = markdown.replace(/<\/entry>/gi, '');

  markdown = markdown.replace(/<\?PubTbl.+?>/gi, '');

  // </tgroup>
  markdown = markdown.replace(/<\/tgroup>/gi, '');
  // <tgroup>
  markdown = markdown.replace(/<tgroup>/gi, '');

  //tgroup
  markdown = markdown.replace(/<tgroup.+?>/gi, '');

  //</tbody>
  markdown = markdown.replace(/<\/tbody>/gi, '');

  // <tbody>
  markdown = markdown.replace(/<tbody>/gi, '');
  markdown = markdown.replace(/<tbody.+?>/gi, '');


  // </colspec>
  markdown = markdown.replace(/<\/colspec>/gi, ''); 
  // colspec
  markdown = markdown.replace(/<colspec.+?>/gi, '');

  // </colgroup>
  markdown = markdown.replace(/<\/colgroup>/gi, '');

  // <colgroup>
  markdown = markdown.replace(/<colgroup>/gi, '');
  markdown = markdown.replace(/<colgroup.+?>/gi, '');

  // <thead>
  markdown = markdown.replace(/<thead>/gi, '');
  markdown = markdown.replace(/<thead.+?>/gi, '');
  // </thead>
  markdown = markdown.replace(/<\/thead>/gi, '');

  // </tfoot>
  markdown = markdown.replace(/<\/tfoot>/gi, '');
  // <tfoot>
  markdown = markdown.replace(/<tfoot>/gi, '');
  markdown = markdown.replace(/<tfoot.+?>/gi, '');

 
  return markdown;
}

buildMd();