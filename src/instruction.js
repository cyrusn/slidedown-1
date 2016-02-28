'use strict';
const helper = require('./helper.js');

function addNavigationInstructions (element) {
  // prepare instruction data
  let keyboard = {
    title: 'Keyboard',
    instructions: [
      'Use left + right arrow keys',
      'Use home/ end key to go to first/ last page',
      'Use r key to go to root page',
      'Use t key to go to Table of Content'
    ]
  };

  let touch = {
    title: 'Touch / Mouse',
    instructions: [
      'Tap or click on the left/right sides to change slide',
      'Swipe left and right to change slide',
      'Press and hold to go to root page',
      'Double tap to go to TOC page'
    ]
  };

  // include keyboard instructions by default
  let instructionArray = [ keyboard ];
  if (typeof Hammer !== 'undefined') {
    // include touch instructions if Hammer is used
    // use column layout
    keyboard.className = 'left';
    touch.className = 'right';
    instructionArray.push(touch);
  }

  // create in-memory DOM objects
  let navInstructions = document.createElement('DIV');
  navInstructions.className = 'navigation-instructions';
  navInstructions.setAttribute('data-layout', 'side-by-side');
  helper.forEach(instructionArray, function (item) {
    navInstructions.appendChild(createInstructionElement(item));
  });

  let footer = document.createElement('FOOTER');
  footer.appendChild(navInstructions);
  // add to DOM
  element.appendChild(footer);

  // helper function
  function createInstructionElement (options) {
    // console.log(options);
    let instructions = document.createElement('DIV');
    if (options.className) {
      instructions.className = options.className;
    }

    let label = document.createElement('SPAN');
    label.className = 'instructions-title';
    label.textContent = options.title;
    instructions.appendChild(label);

    let list = document.createElement('UL');
    instructions.appendChild(list);

    helper.forEach(options.instructions, function (instruction) {
      let listItem = document.createElement('LI');
      listItem.textContent = instruction;
      list.appendChild(listItem);
    });

    return instructions;
  }
}

module.exports = {
  addNavigationInstructions: addNavigationInstructions
};
