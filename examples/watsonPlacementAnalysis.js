import { Iterator } from './core/iterator';
import { getPageText, removePunctuation, removeNumbers } from './shared/html';
import { deDuplicate } from './shared/utils';
import { watsonFetchOptions, identifyLanguageApiUrl, naturalLanguageUnderstandingApiUrl } from './learning/watson';
import { HtmlTable, tableStyle } from './shared/email';
import * as _includes from './polyfills/includes'; _includes;

// Language Detection
const allowedLanguages = ['en'];
// Natural Language Understanding
const costThreshold = 1;
// Email
const emailRecipient = 'example@example.com';

// Start
const accountName = AdWordsApp.currentAccount().getName();

// Watson API
const langUser = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
const langPassword = 'XXXXXXXXXXXX';
const langApiUrl = identifyLanguageApiUrl;
const nluUser = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
const nluPassword = 'XXXXXXXXXXXX';
const nluApiUrl = naturalLanguageUnderstandingApiUrl([
  'categories',
  'concepts',
  'emotion',
  //'keywords',
]);


let sendEmail = false;

const formatText = (str) => {
  str = removePunctuation(str);
  str = removeNumbers(str);
  str = str.split(' ');
  str = deDuplicate(str);
  let start = Math.floor(str.length / 3);
  return str.slice(start, start + 5).join(' ').trim() + ' ' + str.slice(start * 2, (start * 2) + 5).join(' ').trim();
};

const languageDetection = () => {
  let badPlacements = [];
      
  let excludedPlacementList = new Iterator({
    entity: AdWordsApp.excludedPlacementLists(),
    conditions: ['Name = "Language Excluded Placements"']
  }).build();
  
  // Check for placement list
  if(excludedPlacementList.totalNumEntities() === 0){
    excludedPlacementList = AdWordsApp.newExcludedPlacementListBuilder()
         .withName('Language Excluded Placements')
         .build()
         .getResult();
  } else {
    excludedPlacementList = excludedPlacementList.next();
  }
  
  // Start an email table
  let table = new HtmlTable({
    title: 'Language Excluded Placements',
    columns: ['URL','Language','Confidence'],
    style: tableStyle
  });
  
  let placements = new Iterator({
    entity: AdWordsApp.display().placements(),
    conditions: ['Clicks > 0', 'PlacementUrl DOES_NOT_CONTAIN_IGNORE_CASE "anonymous.google"'],
    dateRange: 'YESTERDAY'
  }).toArray({
    url(){ return this.getUrl(); }
  });
  
  placements = deDuplicate(placements);
  
  let length = placements.length;
  
  for(let i = 0; i < length; i += 1){
    let url = placements[i].url;
    
    try {
      let text = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();

      let bodyText = getPageText(text);
      bodyText = formatText(bodyText);
      
      let response = JSON.parse(UrlFetchApp.fetch(langApiUrl + bodyText, watsonFetchOptions(langUser, langPassword)).getContentText());
      let languages = response.languages;
      //Logger.log(url + ' - ' + languages[0].language + ' - ' + languages[0].confidence);
      
      if(!allowedLanguages.includes(languages[0].language) && languages[0].confidence > 0.95){
        badPlacements.push(url);
        let langs = [];
        for(let j = 0; j < 3; j += 1){
          langs.push(languages[j].language);
        }
        langs[0] = `<strong>${langs[0]}</strong>`;
        table.addRow([`<a href="http://www.${url}">${url}</a>`, langs.join(', '), languages[0].confidence]);
        sendEmail = true;
      }
    } catch(e){
      Logger.log(e);
    }
  }
  
  table.close();
  
  excludedPlacementList.addExcludedPlacements(badPlacements);
  
  new Iterator({
    entity: AdWordsApp.campaigns()
  }).run(function(){
    this.addExcludedPlacementList(excludedPlacementList);
  });
  
  return table.html;
};

const naturalLanguageUnderstanding = () => {
  
  let emailBody = '';
  
  let placements = new Iterator({
    entity: AdWordsApp.display().placements(),
    conditions: [`Cost > ${costThreshold}`, 'PlacementUrl DOES_NOT_CONTAIN_IGNORE_CASE "anonymous.google"'],
    dateRange: 'YESTERDAY'
  }).toArray({
    url(){ return this.getUrl(); }
  });
  
  placements = deDuplicate(placements);
  
  let length = placements.length;
  
  for(let i = 0; i < length; i += 1){
    let url = placements[i].url;
    
    let table = new HtmlTable({
      title: `Placement: <a href="http://www.${url}">${url}</a><br>`,
      columns: ['',''],
      style: tableStyle
    });
    
    try {
      let analyze = JSON.parse(UrlFetchApp.fetch(`${nluApiUrl}&url=${url}`, watsonFetchOptions(nluUser, nluPassword)).getContentText());
      
      try {
        let emotion = analyze.emotion.document.emotion;
        sendEmail = true;
        //emailBody += '<h4>Emotion</h4>';
        table.addRow(['Emotion', 'Score'],'th');
        
        for(let j in emotion){
          let emoji;
          if(j === 'joy'){ emoji = '🤗'; }
          else if(j === 'sadness'){ emoji = '😢'; }
          else if(j === 'disgust'){ emoji = '😖'; }
          else if(j === 'anger'){ emoji = '😡'; }
          else { emoji = '😨'; }
          
          table.addRow([`${emoji} ${j}`, emotion[j]]);
        }
      } catch(e){ Logger.log(e); }
      
      try {
        let keywords = analyze.keywords;
        sendEmail = true;
        table.addRow(['Keywords', 'Relevance'],'th');
        
        for(let k in keywords){
          table.addRow([keywords[k].text, keywords[k].relevance]);
        }
      } catch(e){ Logger.log(e); }
      
      try {
        let concepts = analyze.concepts;
        sendEmail = true;
        table.addRow(['Concepts', 'Relevance'],'th');
        
        for(let l in concepts){
          table.addRow([`<a href="${concepts[l].dbpedia_resource}">${concepts[l].text}</a>`, concepts[l].relevance]);
        }
      } catch(e){ Logger.log(e); }
      
      try {
        let categories = analyze.categories;
        sendEmail = true;
        table.addRow(['Categories', 'Score'],'th');
        
        for(let m in categories){
          table.addRow([categories[m].label, categories[m].score]);
        }
      } catch(e){ Logger.log(e); }
      
      emailBody += '<hr>';
      
    } catch(e){ Logger.log(e); }
    
    table.close();
    emailBody += table.html;
  }
  
  return emailBody;
};

const main = function () {
  let emailBody = '';
  
  emailBody += languageDetection();
  emailBody += naturalLanguageUnderstanding();
  
  if (sendEmail === true){
    MailApp.sendEmail({
      to: emailRecipient,
      subject: accountName + ' - Language Analysis',
      htmlBody: emailBody,
    });
  }
};

main();