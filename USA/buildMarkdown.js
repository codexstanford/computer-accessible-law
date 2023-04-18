const fs = require('fs');

const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const { type } = require('os');
const { time } = require('console');

const OUT_DIR = `${__dirname}/md`;


function buildTitleMarkdown(titleId) {

  let title = JSON.parse(fs.readFileSync(`${__dirname}/raw/${titleId}/title.json`, 'utf8'));

  let md = getMd(title, titleId, 0);
  // console.log(md);
  fs.writeFileSync(`${OUT_DIR}/${title.label}.md`, md, 'utf8');
}

function getMd(title, titleId, titleLvl) { 
  let md =''
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
  
  let md = '';
  if (!item) {
    console.log("No item found when expected", item, parent);
    return '';
  }
  if (typeof item.HEAD == 'string') {
    md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD.trim())}\n\n`;
  }
  else if (item.HEAD['#text']) {
    md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD['#text'].trim())}\n\n`;
  }
  else if (Array.isArray(item.HEAD)) { 
    md += `${lvl(++titleLvl)} ${resolveHTMLSepcialChar(item.HEAD[0].trim())}\n\n`;
  }
  else {
    console.log("No Head found when expected", item);
  }
  if (item.P) { 
    if (!Array.isArray(item.P)) { 
      if (typeof item.P == 'string') { 
        md += resolveHTMLSepcialChar(`${item.P}\n\n`);
      }
      else if (item.P['#text']) {
        md += resolveHTMLSepcialChar(`${item.P['#text']}\n\n`);
      }
    }
    else {
      for (let p of item.P) {
        if (typeof p == 'string') { 
          md += resolveHTMLSepcialChar(`${p}\n\n`);
        }
        else if (p['#text']) {
          md += resolveHTMLSepcialChar(`${p['#text']}\n\n`);
        }
      }
    }
   

  }
  if (item.DIV6) {
    if (!Array.isArray(item.DIV6)) { 
      md += buildMD(item.DIV6, titleLvl, item);
    }
    else {
      for (let sub of item.DIV6) { 
        md += buildMD(sub, titleLvl, item);
      }
    }
  }
  if (item.DIV8) {
    if (!Array.isArray(item.DIV8)) { 
      md += buildMD(item.DIV8, titleLvl, item);
    }
    else {
      for (let sub of item.DIV8) { 
        md += buildMD(sub, titleLvl, item);
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
  str = str.replace(/&#x201C;/g, '“');
  str = str.replace(/&#x201D;/g, '”');
  str = str.replace(/&#x2019;/g, '’');

  return str;
}

for (let i = 1; i <= 50; ++ i) {
  console.log("Building title", i);
  buildTitleMarkdown(i);

}
