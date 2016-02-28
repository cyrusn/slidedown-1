var helper = require('./helper.js'),
    layout = require('./layout.js');

function parseHTML(html) {
  var wrapper = document.createElement('DIV');
  wrapper.innerHTML = html;
  return wrapper.children;
}

function eachSlide(doc, callback) {
  var parts   = [],
      counter = 1;

  helper.forEach(doc, function(element) {
    if (element.tagName === 'HR') {
      callback(createSlide(parts), counter++);
      parts = [];
      return;
    }

    parts.push(element);
  });

  if (parts.length > 0) {
    callback(createSlide(parts), counter++);
  }
}

function createSlide(parts) {
  return {
    layout: layout.getSlideLayout(parts),
    html: parts.map(function(part) { return part.outerHTML; }).join('')
  };
}

module.exports = {
  parseHTML: parseHTML,
  eachSlide: eachSlide,
};
