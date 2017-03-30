import { Iterator } from './core/iterator';
import { deDuplicate } from './shared/utils';
import { HtmlTable, tableStyle } from './shared/email';

const emailAddresses = {
  // 'label': 'email@example.com'
  'example': 'example@example.com',
};

let sendEmail = false;

const checkCodes = function () {
  let table = new HtmlTable({
    title: AdWordsApp.currentAccount().getName() + ' - Non-200 URLs',
    columns: ['URL', 'Response Code'],
    style: tableStyle
  });
  let foundErrors = false;
  
  let ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: ['CampaignStatus = ENABLED','AdGroupStatus = ENABLED','Status = ENABLED']
  }).toArray({
    finalUrl(){ return this.urls().getFinalUrl(); }
  });
  
  let urls = deDuplicate(ads);
  let fetchOpts = {
    'followRedirects': false
  };
  
  for(let i in urls){
    let resp = UrlFetchApp.fetch(urls[i].finalUrl, fetchOpts).getResponseCode();
    
    if(resp !== 200.0 && resp !== 201.0){
      foundErrors = true;
      sendEmail = true;
      table.addRow([
        `<a href="${urls[i].finalUrl}">${urls[i].finalUrl}</a>`,
        `<a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${resp}">${resp}</a>`
      ]);
    }
  }
  table.close();
  
  if (foundErrors === false){
    table.html = '';
  }
  
  return table.html;
};

const main = function () {
  for ( let label in emailAddresses ) {
    let emailBody = '';
    let accountIterator = MccApp.accounts()
      .withCondition(`LabelNames CONTAINS_IGNORE_CASE "${label}"`)
      .orderBy('Name')
      .get();
    
    sendEmail = false;
    
    while (accountIterator.hasNext()) {
      let account = accountIterator.next();
      MccApp.select(account);
      
      emailBody += checkCodes();
    }
  
    if (sendEmail === true){
      
      MailApp.sendEmail({
        to: emailAddresses[label],
        subject: 'Daily Ad URL Alerts',
        htmlBody: emailBody,
      });
    }
  }
};

main();
