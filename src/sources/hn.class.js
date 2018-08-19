const api = require('../apis/hn.js')
const html = require('./html-builder.js')

function getCommentsIframe(meta) {
  meta.authorLink = "https://news.ycombinator.com/user?id=" + author;
  meta.titleLink = "https://news.ycombinator.com/item?id=" + id;
  return html.makeIframe('Reddit', meta);
}

function getErrorIframe() {
  let submitlink = `https://news.ycombinator.com/submitlink?u=${url}&t=${title}`
  return html.makeIframeError('Reddit', submitlink);
}

module.exports = {
  check: api.checkHnForUrl,
  fetchComments: api.fetchHnComments,
  getErrorIframe: getErrorIframe,
  getCommentsIframe: getCommentsIframe,
}