const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

var { Extractor } = require('markdown-tables-to-json');


const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);
const countries = JSON.parse(fs.readFileSync('countries.json', 'utf-8'));


async function getAllLegislationForAllCountry() {
  


  // For each country Let OPENAI dream the legisation :)
  for (let country of countries) {
    country = country.name;
    if (!fs.existsSync(`data/raw-${country}.md`)) {
      try {
      let md = await getLegislationFromMemoryForAGivenCountry(country);
      fs.writeFileSync(`data/raw-${country}.md`, md, 'utf-8');
      } catch (e) { }
   }
    else {
      console.log(`country ${country} cache hit`);
    }
  }

 


  // build final markdown to be published
  let md = `# A list of legislation Ressources

`;
  for (let country of countries) {
    country = country.name;
    
    md += `## ${country}\n\n`;

    const rawMd = fs.readFileSync(`data/raw-${country}.md`, 'utf-8');

    md += rawMd;
    
  }

  fs.writeFileSync(`LegislationList.md`, md, 'utf-8');
}

async function getLegislationFromMemoryForAGivenCountry(country) {

  console.log('Country from memory: ', country);
  const systemPrompt = 'you are task to create a markdown table for a given country with a row per state (or equivalent), referencing the url at wich the legislation, status, case law and constitution of the state can be found online. If this country do not have a federal system, just do one line for the country laws. The link text should contain the name of the ressource. do not include {:target="_blank"}. do not put the part after ? in link.The first row should be the federal legislation. DO NOT answer you can not do it. TRY anyway. JUST ouput a table markdown do not justify your reasoning or explain things.'

  const prompt = `Country: ${country}\n`;

  console.log('in');

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages:[{"role": "system", "content": systemPrompt}, {"role": "user", "content": prompt}],
    max_tokens: 6000,
  });

  console.log('out');

  const md = response.data.choices[0].message.content;
  console.log(md);

  return md;
}

async function verifyLinks() { 


}

getAllLegislationForAllCountry();