const fs = require('fs');

let list = fs.readFileSync('./listOfLaws.json', 'utf8');
list = JSON.parse(list);

let md = `# Computer Readable Legislation Project

Most of the legislation are already available online or in a computer readable format. However the format is not always the same and it is not always easy to find the data. This project aims to provide a central repository of all the legislation in different computer readable format.

## How to contribute

If you want to contribute to this project, you can either:
- Propose new legislation to add to the list
- Help us build tool to extract existing legislation
- Help us review the already extracted legislation


`;

let map = {

}

for (let item of list) {
  let target = map;
  for (let t of item.description.section) {
    if (!target[t]) {
      target[t] = {};
    }
    target = target[t];
  }
  target[item.description.content] = item;
}


for (let lvl1 in map) {

  md += `# ${lvl1}\n\n`;

  for (let lvl2 in map[lvl1]) { 
    md += `## ${lvl2}\n\n`;

    for (let lvl3 in map[lvl1][lvl2]) {
      
      let item = map[lvl1][lvl2][lvl3];
      if (item.hosts) {
        md += `\n\n ${lvl3}`;

        for (let host in item.hosts) {
          for(let instance of item.hosts[host]) {
            md += ` [${host}](${instance.url}) `;
          }
        }
        md += `\n\n`;
      }
      else {
        md += `## ${lvl3}\n\n`;
        for (let lvl4 in map[lvl1][lvl2][lvl3]) {
      
          let item = map[lvl1][lvl2][lvl3][lvl4];
          md += `\n\n ${lvl4}`;

          for (let host in item.hosts) {
            for(let instance of item.hosts[host]) {
              md += ` [${host}](${instance.url}) `;
            }
          }
          md += `\n\n`;
        }
      }
    }
  }
}

fs.writeFileSync('./README.md', md, 'utf8');