// const reddit = require('./sources/reddit.class.js');
const hn = require('./sources/hn.class.js');

function getCommentsPromise(src, tag) {
  if (tag.getAttribute('auto') == 'true') {
    let thisUrl = window.location.href;
    return src.check(thisUrl)
      .then((sourceId) => src.fetchComments(sourceId));
  }
  const comments = tag.getAttribute('comments');
  if (comments != null) {
    return src.fetchComments(comments);
  }
  const subreddit = tag.getAttribute('subreddit');
  if (subreddit != null) {
    return src.fetchComments(subreddit);
  }
}

function findComments(src, tagSelector) {
  const tag = document.querySelector(tagSelector);
  if (tag == null) {
    console.error('No tag found');
    return;
  }

  return getCommentsPromise(src, tag)
    .then((commentObj) => { 
      const iframe = src.getCommentsIframe(commentObj);
      tag.appendChild(iframe);
    })
    .catch((err) => { 
      console.error('Error:', err);
      const iframe = src.getErrorIframe();
      tag.appendChild(iframe);
    })
}

function onPageLoad() {
  findComments(hn, 'div[from=hn]')
  // findComments(reddit, 'div[from=reddit]')
}

window.addEventListener('load', onPageLoad)
