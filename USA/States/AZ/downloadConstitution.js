const fs = require('fs');

// https://www.azleg.gov/constitution/

async function main() { 

  let resp = await fetch(`https://www.azleg.gov/constitution/`);
  let text = await resp.text();

  // regexp to capture link and name <td><a href="constitution?article=1">1</a></td><td>STATE BOUNDARIES</td></tr><tr><td>
  let re = /<td><a href="constitution\?article=([0-9]+)">([0-9]+)<\/a><\/td><td>([^<]+)<\/td><\/tr>/g;

  // find all matches in text
  let matches = text.matchAll(re);
  
  /*
  {
    article : "Preamble",
    name : "Preamble",
    url : "https://www.azleg.gov/const/preamble.htm"
  }
  */
  let articles = [];

  // for each match
  for (const match of matches) {
    // get article number
    let article = match[1];
    // get article name
    let name = match[3];
    // get article url
    let url = `https://www.azleg.gov/constitution/constitution?article=${article}`;
    // add to articles array
    articles.push({article, name, url});
  }

  // for each article
  for (const article of articles) {
    console.log(`Getting ${article.article}...`);
    // fetch article
    let resp = await fetch(article.url);
    let text = await resp.text();
    // save article
    
    // match all link in text that looks like https://www.azleg.gov/const/1/2.htm
    let re = /https:\/\/www.azleg.gov\/const\/([0-9]+)\/([0-9]+).htm/g;

    // find all matches in text
    let matches = text.matchAll(re);

    // for each match
    for (const match of matches) {
      // get article number
      let articleId = match[1];
      // get article name
      let name = match[2];
      // get article url
      let url = `https://www.azleg.gov/const/${articleId}/${name}.htm`;
      // add to articles array
      if (!article.children) article.children = [];
      let resp2 = await fetch(url);
      let content = await resp2.text();

      // sleep 500 ms
      await new Promise(resolve => setTimeout(resolve, 500));

      article.children.push({articleId, name, url, content});
    }
    fs.writeFileSync(`${__dirname}/raw/constitution/${article.article}.json`, JSON.stringify(article), 'utf8')
  }

}


main();