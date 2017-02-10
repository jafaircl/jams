export function addTableRow(arr, tag = 'td'){
    
  let html = '<tr>';

  for(let col in arr){
    html += `<${tag}>${arr[col]}</${tag}>`;
  }

  return html + '</tr>';
}

export class HtmlTable {
  
  constructor(props){
    this.cols = props.columns;
    this.html = props.title != undefined ?
      `<body>
        <style>${props.style}</style>
        <table>
          <thead>
            <tr>
              <th colspan = "${this.cols.length}">${props.title}</th>
            </tr>
              ${addTableRow(this.cols, 'th')}
          </thead>
          <tbody>`:
      `<body>
        <style>${props.style}</style>
        <table>
          <thead>${addTableRow(this.cols, 'th')}</thead>
          <tbody>`;
  }
  
  addRow(arr, tag = 'td'){
    
    this.html += '<tr>';
    
    for(let col in arr){
      this.html += `<${tag}>${arr[col]}</${tag}>`;
    }
    
    return this.html + '</tr>';
  }
  
  close(){ return this.html += '</tbody></table></body>'; }
}

export const tableStyle = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin-top: 12px;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    color: #333;
  }

  table {
    table-layout: fixed;
    text-align: left;
    font-size: 13px;
    line-height: 24px;
    border-collapse: separate;
    border-spacing: 0;
    border: 2px solid #E88F47;
    margin: 24px auto;
    width: 80%;
    border-radius: .25rem;
  }

  thead tr:first-child {
    background: rgb(232,143,71);
    color: #fff;
    border: none;
  }

  th:first-child, td:first-child { padding: 0 15px 0 20px; }

  thead tr:last-child th { border-bottom: 3px solid #ddd; }

  tbody tr:hover { background-color: rgba(100,154,166,.1); cursor: default; }
  tbody tr:last-child td { border: none; }
  tbody td {
    padding-right: 24px;
    border-bottom: 1px solid #ddd;
  }
`;
/*

  td:last-child {
    text-align: center;
    padding-right: 10px;
  }
  */