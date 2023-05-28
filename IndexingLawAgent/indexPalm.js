const fs = require('fs');

const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/text-bison-001";

const countries = JSON.parse(fs.readFileSync('countries.json', 'utf-8'));

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(process.env.PALM_KEY),
});





async function getAllLegislationForAllCountry() {
  


  // For each country Let OPENAI dream the legisation :)
  for (let country of countries) {
    country = country.name;
    if (!fs.existsSync(`dataPalm/raw-${country}.md`)) {
      try {
      let md = await getLegislationFromMemoryForAGivenCountry(country);
      fs.writeFileSync(`dataPalm/raw-${country}.md`, md, 'utf-8');
      } catch (e) { }
   }
    else {
      console.log(`country ${country} cache hit`);
    }
  }

 


  // build final markdown to be published
  let md = '# A list of legislation Ressources';
  for (let country of countries) {
    country = country.name;
    
    md += `\n\n## ${country}\n\n`;

    md += fs.readFileSync(`dataPalm/raw-${country}.md`, 'utf-8');


    
  }

  fs.writeFileSync(`LegislationListPALM.md`, md, 'utf-8');
}

async function getLegislationFromMemoryForAGivenCountry(country) {

  console.log('Country from memory: ', country);


  const promptString = `you are task to create a markdown table for a given country with a row per state (or equivalent), referencing the url at wich the legislation, status, case law and constitution of the state can be found online. You need to refer to the official source if possible. If this country do not have a federal system, just do one line for the country laws. The link text should contain the name of the ressource. do not include {:target=\"_blank\"}. do not put the part after ? in link.The first row should be the federal legislation. DO NOT answer you can not do it. TRY anyway. JUST ouput a table markdown do not justify your reasoning or explain things. Country: ${country}`;
  const stopSequences = [];
  
  let answer = await client.generateText({
    // required, which model to use to generate the result
    model: MODEL_NAME,
    // optional, 0.0 always uses the highest-probability result
    temperature: 0.7,
    // optional, how many candidate results to generate
    candidateCount: 1,
    // optional, number of most probable tokens to consider for generation
    top_k: 40,
    // optional, for nucleus sampling decoding strategy
    top_p: 0.95,
    // optional, maximum number of output tokens to generate
    max_output_tokens: 8000,
    // optional, sequences at which to stop model generation
    stop_sequences: stopSequences,
    // optional, safety settings
    safety_settings: [{"category":"HARM_CATEGORY_DEROGATORY","threshold":1},{"category":"HARM_CATEGORY_TOXICITY","threshold":1},{"category":"HARM_CATEGORY_VIOLENCE","threshold":2},{"category":"HARM_CATEGORY_SEXUAL","threshold":2},{"category":"HARM_CATEGORY_MEDICAL","threshold":2},{"category":"HARM_CATEGORY_DANGEROUS","threshold":2}],
    prompt: {
      text: promptString,
    },
  });

  //console.log(JSON.stringify(answer, null, 2));
  console.log('out');

  const md = answer[0].candidates[0].output;
  console.log(md);

  return md;
}

async function verifyLinks() { 


}

getAllLegislationForAllCountry();

