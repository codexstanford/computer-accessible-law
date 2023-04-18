const fs = require('fs');

const TARGET_OUTPUT_DIR = `${__dirname}/raw`;

const RE_DOWNLOAD_ALL = false;

async function getTitlesList() {
  let fetchObj = await fetch('https://www.ecfr.gov/api/versioner/v1/titles.json');
  let titlesJson = await fetchObj.json();
  fs.writeFileSync(`${TARGET_OUTPUT_DIR}/titles.json`, JSON.stringify(titlesJson, null, 2), 'utf8');

  return titlesJson;
}


async function getATitle(title) {
  let fetchObj = await fetch(`https://www.ecfr.gov/api/versioner/v1/structure/2023-04-13/title-${title.number}.json`);
  let titleJSON = await fetchObj.json();
  if (!fs.existsSync(`${TARGET_OUTPUT_DIR}/${title.number}`)) { 
    fs.mkdirSync(`${TARGET_OUTPUT_DIR}/${title.number}`);
  }
  fs.writeFileSync(`${TARGET_OUTPUT_DIR}/${title.number}/title.json`, JSON.stringify(titleJSON, null, 2), 'utf8');
  await getAllChapter(titleJSON, title);
}

async function getAllChapter(title, parent) {
  console.log(title.label);
  if (title.type == "part") {
    await getAChapter(title, parent);
  }
  else {
    if (!title.children) {
      console.warn("Failed to load", title);
    }
    else {
      for (let chapter of title.children) {
        await getAllChapter(chapter, parent);
      }
    }
   
  }
}

async function getAChapter(chapter, title) {
  if (fs.existsSync(`${TARGET_OUTPUT_DIR}/${title.number}/${chapter.identifier}.xml`) && !RE_DOWNLOAD_ALL) { 
    return; 
  }
  let fetchObj = await fetch(`https://www.ecfr.gov/api/versioner/v1/full/2023-04-13/title-${title.number}.xml?part=${chapter.identifier}`);
  let chapterText = await fetchObj.text();
  console.log(`success: ${title.number} - ${chapter.identifier}`)
  if (!fs.existsSync(`${TARGET_OUTPUT_DIR}/${title.number}`)) { 
    fs.mkdirSync(`${TARGET_OUTPUT_DIR}/${title.number}`);
  }

  fs.writeFileSync(`${TARGET_OUTPUT_DIR}/${title.number}/${chapter.identifier}.xml`, chapterText,  'utf8');
}


async function run() {
  let titlesList=  await getTitlesList();

  for (let title of titlesList.titles) {
    await getATitle(title);
  }
}


run();