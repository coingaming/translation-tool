const inputHtml = document.getElementById("input-html");
const translatedContent = document.getElementById("translated-content");
const translationRows = document.getElementById("translation-rows");
const getHTMLButton = document.getElementById("get-html-button");

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
  input.value = value;
  input.dataset.idx = idx;
  input.className = "block w-full p-2 border border-gray-300 rounded-md";
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

inputHtml.addEventListener("input", () => {
  const textNodes = getTextNodes(inputHtml.value);
  renderTranslationInputs(textNodes);
});

getHTMLButton.addEventListener("click", () => {
  const html = translatedContent.innerHTML;
  navigator.clipboard
    .writeText(html)
    .then(() => {
      console.log("HTML copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy HTML: ", err);
    });
});
