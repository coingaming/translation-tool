const inputHtml = document.getElementById("input-html");
const translatedContent = document.getElementById("translated-content");
const translationRows = document.getElementById("translation-rows");
const getHTMLButton = document.getElementById("get-html-button");
const resetButton = document.getElementById("reset-button");

function extractTextNodes(node, nodes = []) {
  if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
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

function createInputElement(value, idx) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value?.trim();
  input.dataset.idx = idx;
  input.className = "block w-full px-2 py-1 border border-gray-300 rounded-md";
  return input;
}

function getTextNodes(html) {
  translatedContent.innerHTML = html;
  return extractTextNodes(translatedContent);
}

function renderTranslationInputs(textNodes) {
  translationRows.innerHTML = "";
  textNodes.forEach((node, idx) => {
    const input = createInputElement(node.nodeValue, idx);
    input.addEventListener("input", (e) => {
      textNodes[idx].nodeValue = e.target.value;
    });

    input.addEventListener("focus", () => {
      const node = textNodes[idx];
      if (
        node.parentNode &&
        node.parentNode.classList &&
        node.parentNode.classList.contains("bg-yellow-200 text-black")
      ) {
        return;
      }
      const span = document.createElement("span");
      span.className = "bg-yellow-200 text-black";
      node.parentNode.insertBefore(span, node);
      span.appendChild(node);
      input._highlightSpan = span;
    });

    input.addEventListener("blur", () => {
      const span = input._highlightSpan;
      if (span && span.parentNode) {
        const textNode = span.firstChild;
        span.parentNode.insertBefore(textNode, span);
        span.parentNode.removeChild(span);
        input._highlightSpan = null;
      }
    });

    input.addEventListener("blur", () => {
      const selection = window.getSelection();
      selection.removeAllRanges();
    });

    translationRows.appendChild(input);
  });
}

function getEmptyStateElement(text) {
  const emptyState = document.createElement("div");
  emptyState.className = "text-gray-400 text-center text-sm py-5";
  emptyState.innerText = text;
  return emptyState;
}

function resetContainers() {
  translatedContent.innerHTML = "";
  translationRows.innerHTML = "";
  translatedContent.appendChild(
    getEmptyStateElement("here will be translated result")
  );
  translationRows.appendChild(
    getEmptyStateElement("here will be texts for translate")
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
    const textNodes = getTextNodes(inputHtml.value);
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
