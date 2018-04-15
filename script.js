var data = [
  {
    name: "apple",
    count: 23
  },
  {
    name: "pineapple",
    count: 40
  },
  {
    name: "pear",
    count: 16
  },
  {
    name: "peach",
    count: 7
  },
  {
    name: "coconut",
    count: 14
  }
];

var searcher = new FuzzySearch(data, ["name"], {
  caseSensitive: false
});

var cache = {};
var timeout;

var KEY_CODE_ARROW_DOWN = 40;
var KEY_CODE_ARROW_UP = 38;
var KEY_CODE_ESCAPE = 27;
var KEY_CODE_ENTER = 13;

function onSelectOption(input, text) {
  input.value = text;
  input.close();
}

function createOption(input, text) {
  var option = document.createElement("li");
  option.classList.add("option");
  option.innerHTML = text;
  option.setAttribute("role", "option");
  option.onclick = onSelectOption.bind(this, input, text);

  return option;
}

function removeOptions(optionsContainer) {
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}

function insertOptions(input, optionsContainer, data) {
  data.map(function(item, index) {
    var option = createOption(input, item.name);

    if (index === 0) {
      option.setAttribute("aria-selected", "true");
      option.classList.add("-focused");
    }

    optionsContainer.appendChild(option);
  });
}

function closeCombobox(combobox, optionsContainer) {
  combobox.setAttribute("aria-expanded", "false");
  removeOptions(optionsContainer);
}

function updateOptions(input, combobox, optionsContainer, data) {
  if (data.length) {
    combobox.setAttribute("aria-expanded", "true");
    removeOptions(optionsContainer);
    insertOptions(input, optionsContainer, data);
  } else {
    closeCombobox(combobox, optionsContainer);
  }
}

function handleOptions(input, combobox, optionsContainer, value) {
  var result;

  if (Object.prototype.hasOwnProperty.call(cache, value)) {
    result = cache[value].slice(0);
    updateOptions(input, combobox, optionsContainer, result);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      result = searcher.search(value);
      cache[value] = result.slice(0);

      updateOptions(input, combobox, optionsContainer, result);
    }, 200);
  }
}

function selectNextOption(optionsContainer) {
  var options = optionsContainer.children;

  for (var i = 0; i < options.length; i++) {
    var option = options[i];

    var foundFocused =
      option.classList.contains("-focused") && i !== options.length - 1;

    if (foundFocused) {
      option.classList.remove("-focused");
      option.setAttribute("aria-selected", "false");

      options[i + 1].classList.add("-focused");
      options[i + 1].setAttribute("aria-selected", "true");
      break;
    }
  }
}

function selectPrevOption(optionsContainer) {
  var options = optionsContainer.children;

  for (var i = 0; i < options.length; i++) {
    var option = options[i];

    var foundFocused = option.classList.contains("-focused") && i !== 0;

    if (foundFocused) {
      option.classList.remove("-focused");
      option.setAttribute("aria-selected", "false");

      options[i - 1].classList.add("-focused");
      options[i - 1].setAttribute("aria-selected", "false");
      break;
    }
  }
}

function selectOption(input, combobox, optionsContainer) {
  var value = optionsContainer.getElementsByClassName("-focused")[0].innerHTML;

  input.value = value;
  input.close();
}

function onKeyUp(combobox, optionsContainer, event) {
  var key = event.which || event.keyCode;
  switch (key) {
    case KEY_CODE_ARROW_UP:
      selectPrevOption(optionsContainer);
      break;
    case KEY_CODE_ARROW_DOWN:
      selectNextOption(optionsContainer);
      break;
    case KEY_CODE_ESCAPE:
      closeCombobox(combobox, optionsContainer);
      break;
    case KEY_CODE_ENTER:
      selectOption(this, combobox, optionsContainer);
      break;
    default:
      handleOptions(this, combobox, optionsContainer, this.value);
      break;
  }
}

function onKeyDown(event) {
  var key = event.which || event.keyCode;

  if (key === KEY_CODE_ENTER) {
    event.preventDefault();
  }
}

function cancelClickOutSize(event) {
  event.stopPropagation();
}

function looseFocus(combobox, optionsContainer, event) {
  closeCombobox(combobox, optionsContainer);
}

function ready() {
  var search = document.getElementById("search");
  var combobox = document.getElementById("combobox");
  var optionsContainer = document.getElementById("options-container");

  search.onkeydown = onKeyDown;
  search.onkeyup = onKeyUp.bind(search, combobox, optionsContainer);
  search.close = closeCombobox.bind(search, combobox, optionsContainer);

  window.onclick = closeCombobox.bind(search, combobox, optionsContainer);
  combobox.onclick = cancelClickOutSize;
}

document.addEventListener("DOMContentLoaded", ready);
