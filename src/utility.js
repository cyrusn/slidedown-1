var marked = require('marked'),
    navigation = require('./navigation.js'),
    helper = require('./helper.js');

function changeTitle(options) {
  var title = 'Slidedown';  // default

  var setting = options.slidedown.title;
  if (typeof setting === 'string' && setting) {
    // use the given string as title
    title = setting;
  }
  else if (typeof setting === 'boolean' && setting) {
    // use the first h1 of the md as title
    var firstH1 = document.getElementsByTagName("h1")[0];
    if (firstH1) {
      title = firstH1.textContent;
    }
  }

  document.title = title;
  return title;
}

function generateTOC() {
  var tocElement = document.getElementById('toc');
  if (!tocElement) return ;
  var headings = document.querySelectorAll("h1, h2");
  var tocMarkdownString = "";

  helper.forEach(headings, function (heading){
    switch (heading.tagName) {
      case 'H1':
        tocMarkdownString += '- [' + heading.textContent + '](#slide-' + navigation.getElementSlideNo(heading) +')\n';
      break;
      case 'H2':
        tocMarkdownString += '\t+ [' + heading.textContent + '](#slide-' + navigation.getElementSlideNo(heading) +')\n';
      break;
      default:
    }
  });

  tocElement.innerHTML = marked(tocMarkdownString);
}

module.exports = {
    changeTitle: changeTitle,
    generateTOC: generateTOC
};
