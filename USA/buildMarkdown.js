const fs = require('fs');

const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const { type } = require('os');
const { time } = require('console');

const OUT_DIR = `${__dirname}/md`;

if (!fs.existsSync(OUT_DIR)) { 
  fs.mkdirSync(OUT_DIR);
}

function buildTitleMarkdown(titleId) {

  let title = JSON.parse(fs.readFileSync(`${__dirname}/raw/${titleId}/title.json`, 'utf8'));

  let md = getMd(title, titleId, 0);
  // console.log(md);
  fs.writeFileSync(`${OUT_DIR}/${title.label}.md`, md, 'utf8');
}

function getMd(title, titleId, titleLvl) { 
  let md ='';
  //console.log(title.label);
  if (title.type == "part") { 

      const parser = new XMLParser();
      let jObj = parser.parse(fs.readFileSync(`${__dirname}/raw/${titleId}/${title.identifier}.xml`, 'utf8'));

      md += buildMD(jObj.DIV5 , titleLvl, jObj);
  }
  else {
    if (!title.label) {
      console.log(title);
    }
    else {
      md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(title.label.trim())}\n\n`;
    }
    
    if (title.children) {
      for (let part of title.children) { 
        md += getMd(part, titleId, titleLvl);
      }
    }
  }
 
  return md;
}

function buildMD(item, titleLvl, parent) {
  //console.log(item);
  let md = '';
  if (!item) {
    console.log("No item found when expected", item, parent);
    return '';
  }
  if (typeof item.HEAD == 'string') {
    md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD.trim())}\n\n`;
  }

  else if (Array.isArray(item.HEAD)) { 
    md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD[0].trim())}\n\n`;
  }
  else if (typeof item.HEAD == 'object') {
    md += `${lvl(++titleLvl)}`;
    if (item.HEAD.I) {
      if (Array.isArray(item.HEAD.I)) { 
        md += `***${resolveHTMLSepcialChar(item.HEAD['I'][0].trim())}*** `;
      }
      else {
        md += `***${resolveHTMLSepcialChar(item.HEAD['I'].trim())}*** `;
      }
    }
    if (item.HEAD['#text']) {
      md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD['#text'].trim())}`;
    }
    md += '\n\n';
  }
  else {
    console.log("No Head found when expected", item);
  }

  if (item.I) {
    if (!Array.isArray(item.I)) { 
      md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.I.trim())}\n\n`;
    }
    else {
      console.log("Stange I:", item)
    }
  }
  if (item.P) { 
    
    if (!Array.isArray(item.P)) { 
      if (typeof item.P == 'string') { 
        md += resolveHTMLSepcialChar(`${item.P}\n\n`);
      }
      else if (item.P['#text']) {
        if (item.P.I) {
          md += resolveHTMLSepcialChar(`${lvl(titleLvl + 1)} ${item.P.I}\n\n`);
        }

        md += resolveHTMLSepcialChar(`${item.P['#text']}\n\n`);
      }
    }
    else {
      for (let p of item.P) {
        if (typeof p == 'string') { 
          md += resolveHTMLSepcialChar(`${p}\n\n`);
        }
        else if (p['#text']) {
          if (p.I) {
            md += resolveHTMLSepcialChar(`${lvl(titleLvl + 1)} ${p.I}\n\n`);
          }
          md += resolveHTMLSepcialChar(`${p['#text']}\n\n`);
        }
      }
    }
   

  }

  for (let i = 1; i < 20; ++i) {
    if (item[`DIV${i}`]) {
      if (!Array.isArray(item[`DIV${i}`])) { 
        md += buildMD(item[`DIV${i}`], titleLvl, item);
      }
      else {
        for (let sub of item[`DIV${i}`]) { 
          md += buildMD(sub, titleLvl, item);
        }
      }
    }
  }

 
 
  return md;
}


function lvl(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += '#';
  }
  return s;
}

function resolveHTMLSepcialChar(str) {
  str = str.replace(/&amp;/g, '&');
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

  // simplify with ...
  str = str.replace(/&#x2026;/g, '...');

  // &#x2713; used in TSA Pre ✓ 
  str = str.replace(/&#x2026;/g, '✓');
  

  // degree
  str = str.replace(/&#xBO;/g, '°');

  // •
  str = str.replace(/&#x2022;/g, '-');
}

for (let i = 1; i <= 50; ++ i) {
  console.log("Building title", i);
  buildTitleMarkdown(i);

}


buildTitleMarkdown(14);