// function getArticleText() {
//   const article = document.querySelector("article");
//   if (article) {
//     return article.innerText;
//   }
//   const paragraphs = Array.from(document.querySelectorAll("p"));
//   return paragraphs.map((p) => p.innerText).join("\n");
// }

// chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//   if ((req.type = "GET_ARTICLE_TEXT")) {
//     const text = getArticleText();
//     sendResponse({ text });
//   }
// });

function getArticleText() {
  const article = document.querySelector("article");
  if (article && article.innerText.length > 100) {
    return article.innerText.trim();
  }

  const paragraphs = Array.from(document.querySelectorAll("p"))
    .map(p => p.innerText.trim())
    .filter(p => p.length > 40);

  return paragraphs.join("\n\n");
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    const text = getArticleText();
    sendResponse({ text });
    return true;
  }
});
