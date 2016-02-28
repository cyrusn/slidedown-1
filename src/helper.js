function inferFormat (title) {
  var extension = title.split('.').pop();

  switch (extension) {
    case 'htm':
    case 'html':
      return 'HTML';

    case 'md':
    case 'markdown':
    default:
      return 'Markdown';
  }
}

function whenReady (callback) {
  if (document.readyState === 'complete') {
    setTimeout(callback, 0);
    return;
  }

  window.addEventListener('load', callback);
}

function forEach (collection, callback) {
  return Array.prototype.forEach.call(collection, callback);
}

function removeClass (element, className) {
  if (!element) { return; }
  element.classList.remove(className);
}

function addClass (element, className) {
  if (!element) { return; }
  element.classList.add(className);
}

module.exports = {
  whenReady: whenReady,
  forEach: forEach,
  removeClass: removeClass,
  addClass: addClass,
  inferFormat: inferFormat
};
