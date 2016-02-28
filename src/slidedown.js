'use strict';
const marked = require('marked');
const hljs = require('highlight.js');
const deepDefaults = require('deep-defaults');
const navigation = require('./navigation.js');
const helper = require('./helper.js');
const layout = require('./layout.js');
const instruction = require('./instruction.js');
const utility = require('./utility.js');
const element = require('./element.js');
const parseMathJaxEquation = require('./parseMathJax');
const plantuml = require('./plantuml.js');

const XMLHttpRequest = window.XMLHttpRequest;
const Hammer = window.Hammer;

(function () {
  function Slidedown () {
    this.target = 'body';
  }

  Slidedown.prototype = {
    // default object, can be set by setOptions()
    // must be put here as static variable as all
    // exported functions are staticized
    options: {
      'marked': {
        'breaks': true
      },
      'slidedown': {
        title: false,
        showImageCaption: false,
        enableMathJax: false
      },
      'mathjax': {
        src: 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
        tex2jax: {
          inlineMath: [['$', '$'], ['$$$', '$$$']]
        },
        'HTML-CSS': {
          linebreaks: {
            automatic: true
          },
          scale: 70
        }
      }
    },

    escapeHTML: (function () {
      let MAP = {
        '"': '&quot;', '&': '&amp;', "'": '&#39;', '/': '&#47;', '<': '&lt;', '>': '&gt;'
      };

      return function (text, forAttribute) {
        return text.replace(
          forAttribute ? /[&<>/'"]/g : /[&<>/]/g,
          function (c) {
            return MAP[c];
          }
        );
      };
    }()),

    parseQuery: function parseQuery () {
      let querystring = document.location.search;
      // remove any preceding url and split
      querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
      const params = {};
      const d = decodeURIComponent;
      let pair = '';
      // match and parse
      for (let i = querystring.length - 1; i >= 0; i--) {
        pair = querystring[i].split('=');
        params[d(pair[0])] = d(pair[1]);
      }

      return params;
    },

    to: function to (target, cb) {
      this.target = target;

      helper.whenReady(function () {
        if (typeof cb === 'function') {
          cb();
        }
      });
    },

    destination: function destination () {
      return (typeof this.target === 'string')
      ? document.querySelector(this.target) : this.target;
    },

    append: function append (element) {
      this.destination().appendChild(element);
    },

    fromElements: function fromElements (elements) {
      const slidedown = this;

      helper.whenReady(function () {
        element.eachSlide(elements, function (slide, number) {
          const element = document.createElement('DIV');
          element.id = 'slide-' + number;
          element.className = 'slide';

          const content = document.createElement('DIV');
          content.className = 'content';
          content.setAttribute('data-layout', slide.layout);
          content.innerHTML = slide.html;
          element.appendChild(content);

          const slideLayout = layout.slideLayouts[slide.layout];
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
        const numSlides = document.getElementsByClassName('slide').length;
        navigation.handleKey(35, navigation.goToSlide(numSlides));

        // using `t` to go to toc page;
        navigation.handleKey(84, navigation.goToToc);

        // using `r` key to go to root page
        // useful when the default md shows a listing of md's
        navigation.handleKey(82, navigation.goToRoot);

        // Hammer integration with feature detection
        if (typeof Hammer !== 'undefined') {
          (function (Hammer) {
            const hammer = new Hammer(document.body);

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

      parseMathJaxEquation(Slidedown.prototype.options);
      return slidedown;
    },

    fromHTML: function fromHTML (html) {
      const elements = element.parseHTML(html);
      return this.fromElements(elements);
    },

    fromMarkdown: function fromMarkdown (markdown) {
      const markedOptions = deepDefaults({
        renderer: new CustomRenderer()
      },
        Slidedown.prototype.options.marked
      );
      marked.setOptions(
        markedOptions
      );

      const html = marked(markdown);
      return this.fromHTML(html);
    },

    fromXHR: function fromXHR (title) {
      const slidedown = this;
      const format = helper.inferFormat(title);

      const request = new XMLHttpRequest();
      request.open('GET', title);

      request.addEventListener('load', function () {
        slidedown['from' + format](request.responseText);
      });

      request.send();

      return this;
    },

    // setOptions() should be run before any other function of Slidedown
    setOptions: function setOptions (options) {
      Slidedown.prototype.options = deepDefaults(
        options, Slidedown.prototype.options);
    }
  };

  function CustomRenderer () {}

  CustomRenderer.prototype = new marked.Renderer();

  CustomRenderer.prototype.image = function (href, title, text) {
    if (Slidedown.prototype.options.slidedown.showImageCaption === true) {
      return '<img src="' + href + '" alt="' + text + '"/><div class="caption">' + text + '</div>';
    }
    return '<img src="' + href + '" alt="' + text + '"/>';
  };

  CustomRenderer.prototype.code = function (code, lang) {
    let html;

    if (lang === 'plantuml') {
      if (!navigator.onLine) return '<blockquote><p>Image of PlantUML <strong>cannot</strong> be loaded, image can only be loaded when connected to <strong>internet</strong></p></blockquote>';
      return '<img class="plantuml" src="' + plantuml(code) + '"/>';
    }

    try {
      html = hljs.highlight(lang, code).value;
    } catch (err) {
      // invalid lang and other error
      // escape before rendering to HTML
      html = Slidedown.prototype.escapeHTML(code);
    }

    return '<pre class="hljs ' + lang + '">' + html + '</pre>';
  };

  function staticize (constructor, properties) {
    const staticized = {};

    helper.forEach(properties, function (property) {
      staticized[property] = function () {
        const instance = new constructor();
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
