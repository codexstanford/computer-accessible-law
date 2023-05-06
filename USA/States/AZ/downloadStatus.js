const fs = require('fs');
const cheerio = require('cheerio');

// https://www.azleg.gov/arstitle/
async function main() { 
  // await getTitle(1);
  for (let i = 2; i < 50; ++i) {
    await getTitle(i);
  }
  
}

async function getTitle(id) {
  // https://www.azleg.gov/arsDetail/?title=1
  let url = `https://www.azleg.gov/arsDetail/?title=${id}`;
  let resp = await fetch(url);
  let text = await resp.text();

  let TITLE = {
    chapters: []
  };

//  <h1 class="topTitle">Title 1 - General Provisions</h1>
  TITLE.titleName = text.match(/<h1 class="topTitle">([^<]+)<\/h1>/)[1];
  console.log (TITLE.titleName);
  // cheerio the text
  const $ = cheerio.load(text);

  let chapters = $('.accordion');
  for (let i = 0; i < chapters.length; ++i) {
    let chapter = chapters[i];
    let chapterTitleHtml = $(chapter).find('h5').html()
    let chapterTitle = chapterTitleHtml.match(/>([^<]+)<\/a>/)[1] 
      + ' - ' 
      + chapterTitleHtml.match(/>([^<]+)<\/div>/)[1];
    console.log(chapterTitle);
    TITLE.chapters[i] = {
      title : chapterTitle,
      articles: []
    }
 //   '<div style="width:100%"><div class="article"><a class="one-sixth first" style="font-width:bold" href="">Article 1</a><span class="five-sixths" style="font-weight:bold">In General</span><div><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00101.htm">1-101</a></li><li class="colright"> Designation and citation</li></ul><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00102.htm">1-102</a></li><li class="colright"> Repealing clause</li></ul><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00103.htm">1-103</a></li><li class="colright"> Effective date</li></ul><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00104.htm">1-104</a></li><li class="colright"> Effect of repealing clause and construction of act</li></ul><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00105.htm">1-105</a></li><li class="colright"> Effect of repeal on prior offenses and punishments</li></ul><ul><li class="colleft"><a class="stat" style="color: #0d10f7;" target="_blank" href="/viewdocument/?docName=https://www.azleg.gov/ars/1/00106.htm">1-106</a></li><li class="colright"> Supplements as part of Revised Statutes</li></ul></div></div><div class="clearfix"></div></div>'
    let articles = $(chapter).find('.article');
    for (let j = 0; j < articles.length; ++j) {
      let article = articles[j];
      let articleTitle = $(article).find('.one-sixth').text() + ' - ' + $(article).find('.five-sixths').text();
      console.log(articleTitle);
      debugger;
      
      let hrefs = $(article).html().matchAll(/href="([^"]+)"/g);
      TITLE.chapters[i].articles[j] = { 
        title: articleTitle,
        sections: []
      }
      for (const href of hrefs) {
        let url = href[1].replace('/viewdocument/?docName=', '');

        let resp = await fetch(url);
        let text = await resp.text();

        TITLE.chapters[i].articles[j].sections.push(text);

        // sleep 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
        
      }
    }
  }

  fs.writeFileSync(`./raw/title-${id}.json`, JSON.stringify(TITLE, null, 2), 'utf8');

}

/*

  let resp = await fetch(`https://www.azleg.gov/arstitle/`);
  let text = await resp.text();

  // regexp to capture link and name <td><a href="constitution?article=1">1</a></td><td>STATE BOUNDARIES</td></tr><tr><td>
  let re = /<td><a href="constitution\?article=([0-9]+)">([0-9]+)<\/a><\/td><td>([^<]+)<\/td><\/tr>/g;

  // find all matches in text
  let matches = text.matchAll(re);

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
*/

main();