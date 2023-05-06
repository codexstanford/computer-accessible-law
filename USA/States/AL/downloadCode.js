const fs = require('fs');

async function main() {
  // constitution
  
  let constitution = await getConstitutionQL(1);
  
  fs.writeFileSync(`./raw/code.json`, JSON.stringify( constitution, null, 2));
}

async function getConstitutionQL(id) {
  console.log('getting', id);


  let req = await fetch("https://gql.api.alison.legislature.state.al.us/graphql", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      "access-control-allow-origin": "*",
      "authorization": "null",
      "content-type": "application/json",
      "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "Referer": "https://alison.legislature.state.al.us/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "{\n    \"query\": \"\\n        {\\n            getCodesByParentId(ParentID: "+ id + ") {\\n            ID,\\n            ParentID,\\n            Title,\\n            UrlStub,\\n            SortOrder,\\n            Html,\\n            Visible,\\n            UniqueKey\\n          }\\n        }\\n        \",\n    \"operationName\": \"\",\n    \"variables\": []\n}",
    "method": "POST"
  });
              
  let res = await req;
  let data = await res.json();

  let returnObj = []
  for (let item of data.data.getCodesByParentId) { 
    if (!item.Html) {
      item.Html =  await getConstitutionQL(item.ID);
    }else {
      
    }
   
    returnObj.push(item);
  }
  return returnObj;
}
main();
