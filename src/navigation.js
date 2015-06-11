var helper = require('./helper.js');

function handleKey(keyCode, callback) {
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === keyCode) {
      callback();
    }
  });
}

function handleTap(event) {
  var tapLocation = event.center.x / window.innerWidth;
  if (tapLocation < 0.1) {
    prevSlide();
  } else if (tapLocation > 0.9) {
    nextSlide();
  }
}

function nextSlide() {
  var current   = document.querySelector('.slide.current'),
      prev      = current.previousElementSibling,
      next      = current.nextElementSibling,
      following = next && next.nextElementSibling;

  if (next) {
    helper.removeClass(prev, 'previous');
    helper.removeClass(current, 'current');
    helper.removeClass(next, 'next');

    helper.addClass(current, 'previous');
    helper.addClass(next, 'current');
    helper.addClass(following, 'next');

    setSlideId(next.id);
  }
}

function prevSlide() {
  var current   = document.querySelector('.slide.current'),
      prev      = current.previousElementSibling,
      next      = current.nextElementSibling,
      preceding = prev && prev.previousElementSibling;

  if (prev) {
    helper.removeClass(next, 'next');
    helper.removeClass(current, 'current');
    helper.removeClass(prev, 'previous');

    helper.addClass(current, 'next');
    helper.addClass(prev, 'current');
    helper.addClass(preceding, 'previous');

    setSlideId(prev.id);
  }
}

function setSlideId(id) {
  window.history.pushState({}, '', '#' + id);
}

function focusTargetSlide() {
  var current  = document.querySelector('.slide.current'),
      previous = document.querySelector('.slide.previous'),
      next     = document.querySelector('.slide.next');

  helper.removeClass(current, 'current');
  helper.removeClass(previous, 'previous');
  helper.removeClass(next, 'next');

  var targetSlide = document.querySelector(window.location.hash || '.slide:first-child');
  helper.addClass(targetSlide, 'current');
  helper.addClass(targetSlide.previousElementSibling, 'previous');
  helper.addClass(targetSlide.nextElementSibling, 'next');

  // Correct for any rogue dragging that occurred.
  setTimeout(function() {
    window.scrollTo(0, window.scrollY);
  }, 0);
}

function goToRoot() {
  location.assign(location.pathname);
}

function goToToc() {
  var tocElement = document.getElementById('toc');
  if (tocElement) {
    goToSlide(getElementSlideNo(tocElement))();
  }
}

function goToSlide(slideNo) {
  return function() {
    setSlideId('slide-' + slideNo);
    focusTargetSlide();
  };
}

function getElementSlideNo(element) {
  while (!(/slide/.test(element.className) || element === null)) {
      element = element.parentNode;
  }
  return parseInt(element.id.substr(6));
}

module.exports = {
  nextSlide: nextSlide,
  prevSlide: prevSlide,
  goToRoot: goToRoot,
  goToToc: goToToc,
  goToSlide: goToSlide,
  focusTargetSlide: focusTargetSlide,
  setSlideId: setSlideId,
  getElementSlideNo: getElementSlideNo,
  handleKey: handleKey,
  handleTap: handleTap
};
