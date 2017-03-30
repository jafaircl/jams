import { Iterator } from './core/iterator';
import { htmlTable, tableStyle } from './shared/email';

function main () {
  
  let table = new htmlTable({
    title: 'Example Title',
    columns: ['Text', 'Ctr'],
    style: tableStyle
  });
  
  new Iterator({
    entity: AdWordsApp.keywords(),
    conditions: ['Impressions > 100', 'Clicks > 0'],
    dateRange: 'ALL_TIME'
  }).run(function(){
    table.addRow([
      this.getText(),
      this.getStatsFor('ALL_TIME').getCtr()
    ]);
  });
  
  table.close();
  
  Logger.log(table);
  
  MailApp.sendEmail({
    to: 'jfaircloth@cocg.co',
    subject: 'Testing',
    htmlBody: table.html,
  });
}

main();