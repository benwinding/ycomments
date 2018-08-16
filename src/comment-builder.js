function makeThread(comment, parentDiv) {
// Create the comment structure

  let commentDiv = document.createElement('div');
  commentDiv.setAttribute('class', 'ycomments-child')
  let date = new Date(comment.created_at);
  let dateString = date.toLocaleDateString() + ' - ' + date.toLocaleTimeString();
  let commentText = comment.text.trim();
  let author = comment.author;
  let authorLink = "https://news.ycombinator.com/user?id="+author;

  const commentHtml = `
    <div class="ycomments-content">
      <div class="ycomments-meta">
        <a class="ycomments-author" href="${authorLink}" target="_blank">${author}</a>
        <span>${dateString}</span>
        <a class="ycomments-toggle" onclick="onClickToggle(this)" >[-]</a>
      </div>
      <div class="ycomments-text">${commentText}</div>
    </div>
  `;
  commentDiv.insertAdjacentHTML('beforeend', commentHtml);
// Add to parentDiv
  parentDiv.appendChild(commentDiv);
  for (const childComment of comment.children) {
    makeThread(childComment, commentDiv)
  }
}

function makeCommentsNode(comments) {
  let commentsRootDiv = document.createElement('div');
  commentsRootDiv.setAttribute("class", "ycomments-root")
  for (const comment of comments) {
    makeThread(comment, commentsRootDiv)
  }

  function onClickToggle(e) {
    const commentDiv = e.parentElement.parentElement.parentElement
    if (e.innerText == '[-]') {
      commentDiv.style.height = '10px'
      e.innerText = '[+]'        
    }
    else {
      commentDiv.style.height = 'unset'
      e.innerText = '[-]'
    }
  };

  const scriptString = `<script>${onClickToggle.toString()}</script>`
  commentsRootDiv.insertAdjacentHTML('beforeend', scriptString)
  return commentsRootDiv;
}

function getHnCommentsNode(thisUrl) {
  return fetchHnComments(result.id)
    .then((comments) => {
      
      return {
        'node': node,
        'results': resultJson
      }
    })
    .catch((err) => console.error(err))
}

function makeIframe(itemObj) {
  const comments = itemObj.comments;
  const meta = itemObj.meta;
  let iframe = document.createElement('iframe');

  function onIframeLoaded() {
    var doc = iframe.contentWindow.document;
    doc.open();
    const node = makeCommentsNode(comments);
    // write comments, creates html structure
    doc.write(node.outerHTML);
    // add stylesheet to iframe head
//     doc.head.appendChild(getCssTagDev())

    // doc.head.appendChild(cssLink)
    let author = meta.author;
    let authorLink = "https://news.ycombinator.com/user?id="+author;
    let title = meta.title;
    let id = meta.id;
    let titleLink = "https://news.ycombinator.com/item?id="+id;

    const headerHtml = `
      <div class="ycomments-header">
        <h1><a href="${titleLink}" target="_blank">${title}</a></h1>
        <p>by <a href="${authorLink}" target="_blank">${author}</a>
        <a href="${titleLink}" target="_blank">10 comments</a>
        </p>
      </div>
    `;
    doc.body.insertAdjacentHTML('afterbegin', headerHtml)
    doc.close();

    iframe.style.WebkitTransition = 'opacity 1s';
    iframe.style.MozTransition = 'opacity 1s';
    iframe.style.height = doc.body.scrollHeight + 'px';
    iframe.style.opacity = '1';
  }

  iframe.style.opacity = '0';
  iframe.setAttribute('name', 'ycomments');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.addEventListener('load', onIframeLoaded);
  return iframe;
}

module.exports = {
  makeIframe: makeIframe,
  getHnCommentsNode: getHnCommentsNode
}