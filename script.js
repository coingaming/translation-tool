const inputHtml = document.getElementById("input-html");
const translatedContent = document.getElementById("translated-content");
const translationRows = document.getElementById("translation-rows");
const originalRows = document.getElementById("origin-rows");
const getHTMLButton = document.getElementById("get-html-button");
const resetButton = document.getElementById("reset-button");
const productButtons = document.getElementById("products");
const directionButtons = document.querySelectorAll("[data-direction]");
const translationButtons = document.querySelectorAll("[data-rows]");

const translatedInputTagName = "textarea";
let textNodes = [];

function isTemplateNode(str) {
  const templateRegex = /^\{\{[\s\S]*\}\}$|^\{%\s*[\s\S]*\s*%\}$/;
  return templateRegex.test(str);
}

function extractTextNodes(node, nodes = []) {
  if (
    node.nodeType === Node.TEXT_NODE &&
    !!node.nodeValue.trim() &&
    !isTemplateNode(node?.nodeValue?.trim())
  ) {
    nodes.push(node);
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.tagName.toLowerCase() !== "style"
  ) {
    for (let child of node.childNodes) {
      extractTextNodes(child, nodes);
    }
  }
  return nodes;
}

document.addEventListener("selectionchange", (e) => {
  const isEditable = document.activeElement.closest("#translated-content");
  if (isEditable) {
    const sel = window.getSelection();
    if (sel.type === "Range") {
      sel.removeAllRanges();
    }
  }
});

function createTranslationInput(value, idx, readOnly = false) {
  const input = document.createElement(translatedInputTagName);
  // input.type = "text";
  input.autocomplete = "off";
  input.rows = 1;
  input.value = value?.trim();
  input.dataset.initialValue = value?.trim();
  input.dataset.idx = idx;
  input.name = `translation-input-${idx}`;
  input.readOnly = readOnly;
  input.className =
    "block w-full px-2 py-1 border border-beerus rounded-md outline-none focus:ring-1 focus:ring-blue-600 min-h-[34px]";
  return input;
}

function createInputWrapper(idx) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2";
  const idxDiv = document.createElement("div");
  idxDiv.className = "text-xs text-trunks/80";
  idxDiv.innerText = `${idx + 1}`;
  wrapper.appendChild(idxDiv);
  return wrapper;
}

function getTextNodesFromHtml(html) {
  translatedContent.innerHTML = html;
  textNodes = extractTextNodes(translatedContent);
}

function renderTranslationInputs() {
  translationRows.innerHTML = "";
  originalRows.innerHTML = "";

  textNodes.forEach((node, idx) => {
    const input = createTranslationInput(node.nodeValue, idx);
    const wrapper = createInputWrapper(idx);
    wrapper.appendChild(input);
    translationRows.appendChild(wrapper);
  });
  textNodes.forEach((node, idx) => {
    const input = createTranslationInput(node.nodeValue, idx, true);
    const wrapper = createInputWrapper(idx);
    wrapper.appendChild(input);
    originalRows.appendChild(wrapper);
  });
}
function reRenderTranslationInputs() {
  textNodes = extractTextNodes(translatedContent);
  renderTranslationInputs();
}

translationRows.addEventListener("input", (e) => {
  if (e.target.tagName.toLowerCase() !== translatedInputTagName) {
    return;
  }
  const value = e.target.value;
  textNodes[e.target.dataset.idx].nodeValue = value;
  updateInputStyles(e.target, value, e.target.dataset.initialValue);
});

translationRows.addEventListener("focusin", (event) => {
  if (event.target.tagName.toLowerCase() !== translatedInputTagName) {
    return;
  }
  const node = textNodes[event.target.dataset.idx];
  highlightTextNode(node, event.target);
});

translationRows.addEventListener("focusout", (event) => {
  if (event.target.tagName.toLowerCase() !== translatedInputTagName) {
    return;
  }
  removeHighlight(event.target);
  clearSelection();
});

translationRows.addEventListener("keydown", (event) => {
  if (event.target.tagName.toLowerCase() !== translatedInputTagName) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
  }
});

function updateInputStyles(input, value, initialValue) {
  if (value.trim() !== initialValue && value.trim() !== "") {
    input.classList.add("!bg-success/10", "!border-success");
  } else {
    input.classList.remove("!bg-success/10", "!border-success");
  }
  if (value.trim() === "") {
    input.classList.add("!bg-danger/10", "!border-danger");
  } else {
    input.classList.remove("!bg-danger/10", "!border-danger");
  }
}

function highlightTextNode(node, input) {
  if (
    node.parentNode &&
    node.parentNode.classList &&
    node.parentNode.classList.contains("bg-highlight")
  ) {
    return;
  }
  const span = document.createElement("span");
  span.className = "bg-highlight !text-black";
  node.parentNode.insertBefore(span, node);
  span.appendChild(node);
  input._highlightSpan = span;
}

function removeHighlight(input) {
  const span = input._highlightSpan;
  if (span && span.parentNode) {
    const textNode = span.firstChild;
    span.parentNode.insertBefore(textNode, span);
    span.parentNode.removeChild(span);
    input._highlightSpan = null;
  }
}

function clearSelection() {
  const selection = window.getSelection();
  selection.removeAllRanges();
}

function createEmptyStateElement(text) {
  const emptyState = document.createElement("div");
  emptyState.className = "!text-trunks text-center text-sm py-5";
  emptyState.innerText = text;
  return emptyState;
}

function resetContainers() {
  translatedContent.innerHTML = "";
  translationRows.innerHTML = "";
  originalRows.innerHTML = "";
  translatedContent.appendChild(
    createEmptyStateElement("here will be translated result")
  );
  translationRows.appendChild(
    createEmptyStateElement("here will be texts for translate")
  );
  originalRows.appendChild(
    createEmptyStateElement("here will be origin texts")
  );
}

function showNotification(message, className = "bg-green-600") {
  const notification = document.createElement("div");
  notification.className =
    "fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-md " +
    className;
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
}

function switchDirection(e) {
  const direction = e.target.dataset.direction;
  const html = document.documentElement;
  html.dir = direction;
  directionButtons.forEach((button) => {
    button.classList.remove("active");
  });
  e.target.classList.add("active");
}

translatedContent.addEventListener("click", (event) => {
  event.preventDefault();
});

function mergeAdjacentTextNodes(container) {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );
  let node = walker.nextNode();

  while (node) {
    const next = node.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE) {
      node.textContent += next.textContent;
      next.remove();
      continue;
    }
    node = walker.nextNode();
  }
}

translatedContent.addEventListener("beforeinput", (e) => {
  const type = e.inputType;

  if (type === "insertLineBreak") {
    e.preventDefault();
    document.execCommand("insertLineBreak");
    reRenderTranslationInputs();
    return;
  }

  if (type === "deleteContentBackward") {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);

    const { startContainer, startOffset } = range;

    if (startContainer.nodeType === Node.TEXT_NODE) {
      if (startOffset > 0) {
        e.preventDefault();
        return;
      }

      const prevNode = startContainer.previousSibling;
      if (!(prevNode && prevNode.nodeName === "BR")) {
        e.preventDefault();
      }

      requestAnimationFrame(() => {
        mergeAdjacentTextNodes(translatedContent);
      });
      setTimeout(() => {
        reRenderTranslationInputs();
      }, 0);

      return;
    }

    if (startContainer.nodeType === Node.ELEMENT_NODE) {
      const prevNode = startContainer.childNodes[startOffset - 1];
      if (!(prevNode && prevNode.nodeName === "BR")) {
        e.preventDefault();
      }
    }
  }

  e.preventDefault();
});

resetButton.addEventListener("click", () => {
  inputHtml.value = "";
  resetContainers();
});

inputHtml.addEventListener("input", () => {
  if (!inputHtml.value.trim()) {
    resetContainers();
  } else {
    getTextNodesFromHtml(inputHtml.value);
    renderTranslationInputs();
  }
});

getHTMLButton.addEventListener("click", () => {
  const html = translatedContent.innerHTML;
  if (!inputHtml.value.trim()) {
    showNotification("Please enter some HTML content", "bg-red-500");
    return;
  }
  navigator.clipboard
    .writeText(html)
    .then(() => {
      showNotification("Translated HTML copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy HTML: ", err);
    });
});

productButtons.addEventListener("click", (event) => {
  if (event.target.tagName.toLowerCase() === "button") {
    const product = event.target.dataset.product;
    document.documentElement.className = product;
    const buttons = productButtons.querySelectorAll("button");
    buttons.forEach((btn) => btn.classList.remove("bg-piccolo", "text-goten"));
    event.target.classList.add("bg-piccolo", "text-goten");
  }
});

directionButtons.forEach((button) => {
  button.addEventListener("click", switchDirection);
});

translationButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    translationButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn !== button) {
        const otherId = btn.dataset.rows;
        const other = document.getElementById(otherId);
        if (other) {
          other.classList.add("hidden");
        }
      }
    });

    const targetId = button.dataset.rows;
    const target = document.getElementById(targetId);
    event.target.classList.add("active");
    if (target) {
      target.classList.remove("hidden");
    }
  });
});

resetContainers();
