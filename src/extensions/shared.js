export function checkExtensionType(type){
  switch ( type ) {
  case '1':
    return 'Sitelink';
  case '2':
    return 'Call';
  case '7':
    return 'Location';
  case '8':
    return 'Review';
  case '17':
    return 'Callout';
  case '23':
    // Marketing Image
    return 'Marketing Image';
  case '24':
    return 'Structured Snippet';
  default:
    return type;
  }
}

export function formatExtensionHtml(type, extension){
  extension = JSON.parse(extension);
  switch ( type ) {
  case '1': // Sitelink
    let title = extension['2'] === undefined ? extension['1'] : `${extension['1']} - ${extension['2']}`;
    return `<a href="${extension['5']}">${title}</a><br>${extension['3']}<br>${extension['4']}`;
  case '2': // Call
    return `<span>${extension['1']}</span>`;
  case '7': // Location
    return `<span>${extension['1']}<br>
            ${extension['2']}<br>
            ${extension['4']}, ${extension['5']} ${extension['6']}<br>
            ${extension['8']}</span>`;
  case '8': // Review
    return `<span>${extension['1']} - <a href="${extension['3']}">${extension['2']}</a></span>`;
  case '17': // Callout
    return `<span>${extension['1']}</span>`;
  case '23': // Marketing Image
    return `<span><pre>${extension}</pre></span>`;
  case '24': // Structured Snippet
    return `<span><i>${extension['1']}</i><br>${extension['2'].join('<br>')}</span>`;
  default: 
    return `<span>${extension.toString()}</span>`;
  }
}