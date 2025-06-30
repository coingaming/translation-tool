const inputHtml = document.getElementById("input-html");
const originalContent = document.getElementById("original-content");
const translatedContent = document.getElementById("translated-content");
const getHTMLButton = document.getElementById("get-html-button");

inputHtml.addEventListener("input", () => {
  const htmlContent = inputHtml.value;
  originalContent.innerHTML = htmlContent;
  translatedContent.innerHTML = htmlContent;
});

translatedContent.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text/plain");
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  selection.deleteFromDocument();
  selection.getRangeAt(0).insertNode(document.createTextNode(text));
  selection.collapseToEnd();
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
