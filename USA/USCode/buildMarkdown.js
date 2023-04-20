const fs = require('fs');

var convert = require('xml-js');


const OUT_DIR = `${__dirname}/md`;

if (!fs.existsSync(OUT_DIR)) { 
  fs.mkdirSync(OUT_DIR);
}

function buildTitleMarkdown(titleId) {

  let jObj = convert.xml2json(
    fs.readFileSync(`${__dirname}/raw/usc${titleId}.xml`, 'utf8'),
    {compact: false, spaces: 1, ignoreInstruction	: true}
  );

  jObj = JSON.parse(jObj).elements[0];

  let md = getMd(jObj, 0);

  md = md.replace(/\n\n\n*/g, '\n\n');
  md = md.replace(/  */g, ' ');


  let lines = md.split('\n');
  let nLine = [];
  for (let line of lines) {
    line = line.trim();
    if (line.indexOf('—') == line.length - 1) {
      line = line.replace('—', '');
      line = line.replace(/::@::/g, '');
    }
    else {
      line = line.replace(/::@::#*::@::/g, '');
    }
    nLine.push(line);
  }
  md = nLine.join('\n');
  fs.writeFileSync(`${OUT_DIR}/${titleId}.md`, md, 'utf8');
}

function getMd( node, titleLvl, parent) { 



  let md ='';
  // root
  if (node.name == 'uscDoc' || node.name == 'main' || node.name =='title' || node.name =='subtitle' || node.name == 'chapter' || node.name == 'section' || node.name == 'subsection') {
    for (let element of node.elements) {
      md += getMd(element, titleLvl, node);
    }
    return md;
  }
  // ignode
  if (node.name == 'meta' || node.name == 'note' || node.name == 'toc' || node.name == 'notes' || node.name == 'sourceCredit') {
    return md;
  }

  let titleH = {
    title : 1,
    subtitle : 2,
    chapter : 3,
    section : 4,
    subsection : 5
  };

  if (node.name == 'num') {

    //console.log(parent);
    
    if (parent.name == 'paragraph' ) {// parent.attributes.class == "indent0") {
      md += '\n\n';
    }
    else if (parent.attributes.class == "indent0") {
      md += `\n\n::@::${lvl(parent.attributes.identifier.split('/').length)}::@:: `;
    }
    else {
      md +=  `\n\n${lvl(titleH[parent.name] || 0)} `;
    }
  
  }

  if (node.type == 'text') {
    md += node.text + ' ';
  }

  if (node.elements) {
    for (let element of node.elements) {
      md += getMd(element, titleLvl, node);
    }
  }

  if (node.name == "heading" || node.name == 'p')  {
    md += `\n\n`;
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
  
  return str;
}


//return;
for (let i = 1; i <= 52; ++ i) {
  console.log("Building title", i);
  if (i < 10) {
    buildTitleMarkdown('0' + i);
  }
  else {
    buildTitleMarkdown(i);
  }

}

buildTitleMarkdown(54);
buildTitleMarkdown('50A');