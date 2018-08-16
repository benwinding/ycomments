require('./main.css');
const apis = require('./apis.js');
const builder = require('./comment-builder.js');

function getItemId(itemValue) {
  if (itemValue == 'auto') {
    let thisUrl = window.location.href;
    return apis.checkHnForUrl(thisUrl)
      .then((res) => {
        return res.id;
      })
  }
  else {
    return Promise.resolve(itemValue);
  }
}

function getCommentObj(itemValue) {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production'

  if (isDev) {
    const cssTxt = require('./sample.json')
    return Promise.resolve(cssTxt);
  }
  else {
    return getItemId(itemValue)
      .then((commentsId) => apis.fetchHnComments(commentsId))
  }
}

function addIframeToPage(commentsObj) {
  let ycommentsRoot = document.querySelector('div[comments]');
  let iframe = builder.makeIframe(commentsObj);
  ycommentsRoot.appendChild(iframe);
}

function addIframeErrorToPage() {
  let ycommentsRoot = document.querySelector('div[comments]');
  let iframe = builder.makeIframeError();
  ycommentsRoot.appendChild(iframe);
}

function onPageLoad() {
  let ycommentsRoot = document.querySelector('div[comments]');
  let itemValue = ycommentsRoot.getAttribute('comments');

  getCommentObj(itemValue)
    .then((commentsObj) => addIframeToPage(commentsObj))
    .catch((err) => {
      addIframeErrorToPage()
      console.error(err);
    })
}

window.addEventListener('load', onPageLoad)
