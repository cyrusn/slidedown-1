module.exports = function parseMathJaxEquation(options){
  if (options.slidedown.enableMathJax){
    var mathjax = document.createElement('script');
    mathjax.type = "text/javascript";
    mathjax.src = options.mathjax.src;
    mathjax.text = 'MathJax.Hub.Config(' + JSON.stringify(options.mathjax) + ")";
    document.head.appendChild(mathjax);
  }
}

