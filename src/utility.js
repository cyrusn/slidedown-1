'use strict';
const marked = require('marked');
const navigation = require('./navigation.js');
const helper = require('./helper.js');

function changeTitle (options) {
  let title = 'Slidedown';  // default

  const setting = options.slidedown.title;
  if (typeof setting === 'string' && setting) {
    // use the given string as title
    title = setting;
  } else if (typeof setting === 'boolean' && setting) {
    // use the first h1 of the md as title
    const firstH1 = document.getElementsByTagName('h1')[0];
    if (firstH1) {
      title = firstH1.textContent;
    }
  }

  document.title = title;
  return title;
}

function generateTOC () {
  const tocElement = document.getElementById('toc');
  if (!tocElement) return;
  const headings = document.querySelectorAll('h1, h2');
  let tocMarkdownString = '';

  helper.forEach(headings, function (heading) {
    switch (heading.tagName) {
      case 'H1':
        tocMarkdownString += '- [' + heading.textContent + '](#slide-' + navigation.getElementSlideNo(heading) + ')\n';
        break;
      case 'H2':
        tocMarkdownString += '\t+ [' + heading.textContent + '](#slide-' + navigation.getElementSlideNo(heading) + ')\n';
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
