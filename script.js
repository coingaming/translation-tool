const inputHtml = document.getElementById("input-html");
const translatedContent = document.getElementById("translated-content");
const translationRows = document.getElementById("translation-rows");
const getHTMLButton = document.getElementById("get-html-button");
const resetButton = document.getElementById("reset-button");
const productButtons = document.getElementById("products");

function isTemplateNode(str) {
  const templateRegex = /^\{\{.*\}\}$/;
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

function createTranslationInput(value, idx) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value?.trim();
  input.dataset.initialValue = value.trim();
  input.dataset.idx = idx;
  input.name = `translation-input-${idx}`;
  input.className =
    "block w-full px-2 py-1 border border-beerus rounded-md outline-none focus:ring-1 focus:ring-blue-600";
  return input;
}

function getTextNodesFromHtml(html) {
  translatedContent.innerHTML = html;
  return extractTextNodes(translatedContent);
}

function renderTranslationInputs(textNodes) {
  translationRows.innerHTML = "";
  textNodes.forEach((node, idx) => {
    const input = createTranslationInput(node.nodeValue, idx);
    attachInputEvents(input, node, textNodes, idx);
    translationRows.appendChild(input);
  });
}

function attachInputEvents(input, node, textNodes, idx) {
  input.addEventListener("input", (e) => {
    textNodes[idx].nodeValue = e.target.value;
    updateInputStyles(input, e.target.value, input.dataset.initialValue);
  });

  input.addEventListener("focus", () => {
    highlightTextNode(node, input);
  });

  input.addEventListener("blur", () => {
    removeHighlight(input);
    clearSelection();
  });
}

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
  translatedContent.appendChild(
    createEmptyStateElement("here will be translated result")
  );
  translationRows.appendChild(
    createEmptyStateElement("here will be texts for translate")
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

translatedContent.addEventListener("click", (event) => {
  event.preventDefault();
});

resetButton.addEventListener("click", () => {
  inputHtml.value = "";
  resetContainers();
});

inputHtml.addEventListener("input", () => {
  if (!inputHtml.value.trim()) {
    resetContainers();
  } else {
    const textNodes = getTextNodesFromHtml(inputHtml.value);
    renderTranslationInputs(textNodes);
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

resetContainers();
