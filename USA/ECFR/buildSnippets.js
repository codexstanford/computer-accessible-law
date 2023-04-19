const fs = require('fs');

const INPUT_PATH = `${__dirname}/md`;
const OUTPUT_PATH = `${__dirname}/snippets`;

// feature flag
const EXTRACT_DEFINITION = true;
// recursivelly read all file and create the shadow structure / snippet

if (!fs.existsSync(OUTPUT_PATH)) { 
    fs.mkdirSync(OUTPUT_PATH);
}

run(INPUT_PATH);

async function run(path) {
  let files = fs.readdirSync(path);
  for (let file of files) {
    if (file.indexOf('.md') != -1) {
      let snippets = await splitFile(fs.readFileSync(`${path}/${file}`, 'utf8'), path.replace(INPUT_PATH, ""));
      if (!snippets) 
      {
        snippets = [];
      }
      for (let [index, snippet] of snippets.entries()) {
    //    console.log(index, snippet);

        if (!fs.existsSync(`${path.replace(INPUT_PATH, OUTPUT_PATH)}/${file}`)) {
          fs.mkdirSync(`${path.replace(INPUT_PATH, OUTPUT_PATH)}/${file}`);
        }

        fs.writeFileSync(`${path.replace(INPUT_PATH, OUTPUT_PATH)}/${file}/${index}.md`, snippet, 'utf8');
      }
    }
    else {
      if (!fs.existsSync(`${path.replace(INPUT_PATH, OUTPUT_PATH)}/${file}`)) {
        fs.mkdirSync(`${path.replace(INPUT_PATH, OUTPUT_PATH)}/${file}`);
      }
      run(`${path}/${file}`);
    }
    
  }
}


async function splitFile(markdown, path) {
  const headers = path.split('/').join('\n').trim();
  const md = markdown.split('\n');

  let titleHierarchy = [];
  let currentClause = [];
  
  let snippets = [];
  for (let line of md) {
    if (line.indexOf('<sapn') != -1) {
      // dutch law md contains html tags
      continue;
     }
    let lvl = getTitleLvl(line);
    if (lvl) {
      if (currentClause.length) {

     
          const snippet = renderClause(currentClause, titleHierarchy);
          if (snippet) {
            snippets.push(`${headers}\n${snippet}`);
          }
        currentClause = [];
      }
      titleHierarchy.push(line.trim());
    }
    else {
      currentClause.push(line.trim());
    }
  }


  return snippets;
}



function getTitleLvl(str) {
  let lvl = 0;
  for (let c of str) {
    if (c == '#') {
      lvl++;
    }
    else {
      return lvl;
    }
  }
  return lvl;
}





function renderClause(clause, titles) {

  //handle empty clauses
  if (!clause.join().trim().length) {
    return;
  }
  let maxLvl = 10000;
  let selectedTitles = [];
  for (let i = titles.length -1; i >= 0; i--) {
    let lvl = getTitleLvl(titles[i]);
    if (maxLvl > lvl) {
      maxLvl = lvl;
      selectedTitles.unshift(titles[i]);
    }
  }

  let renderText = selectedTitles.join('\n');
  renderText += '\n';
  renderText += clause.join('\n');


  return renderText;

}

