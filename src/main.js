require('./main.css');
const apis = require('./apis.js');
const builder = require('./comment-builder.js');

function getItemId(itemValue) {
  if (itemValue == 'auto') {
    // let thisUrl = window.location.href;
    let thisUrl = 'http://www.youtube.com/watch?v=oVfHeWTKjag';
    return apis.checkHnForUrl(thisUrl)
      .then((res) => {
        return res.id;
      })
  }
  else {
    return Promise.resolve(itemValue);
  }
}

function addIframeToPage(commentsObj) {
  let ycommentsRoot = document.querySelector('div[comments]');
  let iframe = builder.makeIframe(commentsObj);
  ycommentsRoot.appendChild(iframe);
}


function getCommentObj() {
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

function onPageLoad() {
  let ycommentsRoot = document.querySelector('div[comments]');
  let itemValue = ycommentsRoot.getAttribute('comments');

  getCommentObj()
    .then((commentsObj) => addIframeToPage(commentsObj))
    .catch((err) => console.error(err))
}

window.addEventListener('load', onPageLoad)
