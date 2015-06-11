var marked = require('marked'),
    hljs   = require('highlight.js'),
    deepDefaults = require('deep-defaults'),
    navigation = require('./navigation.js'),
    helper = require('./helper.js'),
    layout = require('./layout.js'),
    instruction = require('./instruction.js'),
    utility = require('./utility.js'),
    element = require('./element.js');

(function() {

  function Slidedown() {
    this.target = 'body';
  }

  Slidedown.prototype = {
    // default object, can be set by setOptions()
    // must be put here as static variable as all
    // exported functions are staticized
    options: {
      "marked": {
        "breaks": true
      },
      "slidedown": {
        title: false,
        showImageCaption: false
      }
    },

    escapeHTML: (function () {
        var MAP = {
            '"': '&quot;', '&': '&amp;', "'": '&#39;',
            '/': '&#47;',  '<': '&lt;',  '>': '&gt;'
        };

        return function (text, forAttribute) {
          return text.replace(
            forAttribute ? /[&<>/'"]/g : /[&<>/]/g,
            function(c) {
              return MAP[c];
            }
          );
        };
    }()),

    parseQuery: function parseQuery() {
        var querystring = document.location.search;
        // remove any preceding url and split
        querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
        var params = {}, pair, d = decodeURIComponent;
        // match and parse
        for (var i = querystring.length - 1; i >= 0; i--) {
            pair = querystring[i].split('=');
            params[d(pair[0])] = d(pair[1]);
        }

        return params;
    },

    to: function to(target, cb) {
      this.target = target;

      helper.whenReady(function() {
        if (typeof cb === "function") {
          cb();
        }
      });
    },

    destination: function destination() {
      var destination = typeof this.target === 'string' ?
        document.querySelector(this.target) : this.target;
      return destination;
    },

    append: function append(element) {
      this.destination().appendChild(element);
    },

    fromElements: function fromElements(elements) {
      var slidedown = this;

      helper.whenReady(function() {
        element.eachSlide(elements, function(slide, number) {
          var element = document.createElement('DIV');
          element.id = 'slide-' + number;
          element.className = 'slide';

          var content = document.createElement('DIV');
          content.className = 'content';
          content.setAttribute('data-layout', slide.layout);
          content.innerHTML = slide.html;
          element.appendChild(content);

          var slideLayout = layout.slideLayouts[slide.layout];
          if (slideLayout && typeof slideLayout.postprocess === 'function') {
            slideLayout.postprocess(content);
          }

          if (number === 1) {
            instruction.addNavigationInstructions(element);
          }

          slidedown.append(element);
        });

        // Attach left/right keyboard shortcuts
        navigation.handleKey(39, navigation.nextSlide);
        navigation.handleKey(37, navigation.prevSlide);

        // more key feature:
        // using `home` key to go to first page
        navigation.handleKey(36, navigation.goToSlide(1));

        // using `end` key to go to last page
        var numSlides = document.getElementsByClassName('slide').length;
        navigation.handleKey(35, navigation.goToSlide(numSlides));

        // using `t` to go to toc page;
        navigation.handleKey(84, navigation.goToToc);

        // using `r` key to go to root page
        // useful when the default md shows a listing of md's
        navigation.handleKey(82, navigation.goToRoot);

        // Hammer integration with feature detection
        if (typeof Hammer !== 'undefined') {
          (function(Hammer) {
            var hammer = new Hammer(document.body);

            // enable double tap
            hammer.get('tap').set({
              touchAction: 'multitap'
            });

            // swipe left and right to change slide
            hammer.on('swipeleft', navigation.nextSlide);
            hammer.on('swiperight', navigation.prevSlide);

            // tap to flip slides
            hammer.on('tap', navigation.handleTap);

            // press and hold to go to root page
            hammer.on('press', navigation.goToRoot);

            // double tap to go to toc page
            hammer.on('doubletap', navigation.goToToc);
          }(Hammer));
        }

        // Change title to the first h1 of md
        utility.changeTitle(Slidedown.prototype.options);

        // Generate TOC if #toc is found
        utility.generateTOC();

        // Focus on the target slide (or first, by default)
        navigation.focusTargetSlide();
        window.addEventListener('hashchange', navigation.focusTargetSlide);
      });

      return slidedown;
    },

    fromHTML: function fromHTML(html) {
      var elements = element.parseHTML(html);
      return this.fromElements(elements);
    },

    fromMarkdown: function fromMarkdown(markdown) {
      var markedOptions = deepDefaults({
          renderer: new CustomRenderer()
        },
        Slidedown.prototype.options.marked
      );
      marked.setOptions(
        markedOptions
      );

      var html = marked(markdown);
      return this.fromHTML(html);
    },

    fromXHR: function fromXHR(title) {
      var slidedown = this,
          format    = helper.inferFormat(title);

      var request = new XMLHttpRequest();
      request.open('GET', title);

      request.addEventListener('load', function() {
        slidedown['from' + format](request.responseText);
      });

      request.send();

      return this;
    },

    // setOptions() should be run before any other function of Slidedown
    setOptions: function setOptions(options) {
      Slidedown.prototype.options = deepDefaults(
        options, Slidedown.prototype.options);
    }
  };

  function CustomRenderer() {}

  CustomRenderer.prototype = new marked.Renderer();

  CustomRenderer.prototype.image = function(href, title, text) {
    if (Slidedown.prototype.options.slidedown.showImageCaption === true) {
      return '<img src="' + href + '" alt="' + text + '"/><div class="caption">' + text + '</div>';
    }
    return '<img src="' + href + '" alt="' + text +'"/>';
  };

  CustomRenderer.prototype.code = function code(code, lang) {
    var html;

    try {
      html = hljs.highlight(lang, code).value;
    }
    catch (err) {
      // invalid lang and other error
      // escape before rendering to HTML
      html = Slidedown.prototype.escapeHTML(code);
    }

    return '<pre class="hljs ' + lang + '">' + html + '</pre>';
  };

  function staticize(constructor, properties) {
    var staticized = {};

    helper.forEach(properties, function(property) {
      staticized[property] = function() {
        var instance = new constructor();
        return instance[property].apply(instance, arguments);
      };
    });

    return staticized;
  }

  window.Slidedown = staticize(Slidedown, [
    'fromElements',
    'fromHTML',
    'fromMarkdown',
    'fromXHR',
    'parseQuery',
    'setOptions'
  ]);

})();
