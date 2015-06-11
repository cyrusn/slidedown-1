var slideLayouts = {
  'title-only': { pattern: /^H1$/ },
  'title-subtitle': { pattern: /^H1,H2$/ },
  'side-by-side': {
    pattern: /^H1,.+,H1,.+$/,
    postprocess: function(content) {
      var left = document.createElement('DIV');
      left.className = 'left';
      // content.appendChild(left);

      // Insert the first <H1> and the stuff below it (but before the second
      // <H2>) into the left pane.
      do {
        left.appendChild(content.firstChild);
      } while (content.firstChild.tagName !== 'H1');

      var right = document.createElement('DIV');
      right.className = 'right';

      // Insert everything else into the right pane.
      do {
        right.appendChild(content.firstChild);
      } while (content.firstChild);

      content.appendChild(left);
      content.appendChild(right);
    }
  }
};

function getSlideLayout(parts) {
  var key = parts.map(function(part) { return part.tagName; }).join(',');

  for (var layout in slideLayouts) {
    if (slideLayouts[layout].pattern.test(key)) {
      return layout;
    }
  }

  return 'default';
}

module.exports = {
  slideLayouts: slideLayouts,
  getSlideLayout: getSlideLayout
};
