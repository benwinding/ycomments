const isDev = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production'
console.log('isDev:' + isDev)

const cssTxt = require('./main.css')
function getCssStyleElement() {
  let tag;
  if (isDev) {
    tag = document.createElement('link');
    tag.href = './dist/main.css';
    tag.rel = "stylesheet"; 
    tag.type = "text/css"; 
  } else {
    tag = document.createElement('style');
    tag.innerHTML = cssTxt;
  }
  return tag;
}

const svgIcon = require('./icon-white.svg')
function getSvgElement() {
  let tag;
  tag = document.createElement('div');
  tag.setAttribute('class', 'icon');
  let link = document.createElement('a');
  link.href = 'https://rahn.benwinding.com/';  
  link.target = '_blank';
  link.innerHTML = svgIcon;
  tag.appendChild(link);
  return tag;
}

function makeThread(comment, parentDiv) {
  // Create the comment structure
  let commentDiv = document.createElement('div');
  commentDiv.setAttribute('class', 'rahn-child')
  let date = new Date(comment.created_at);
  let dateString = date.toLocaleDateString() + ' - ' + date.toLocaleTimeString();
  let commentText = comment.text;
  let author = comment.author;
  if (!commentText || !author)
    return;
  let authorLink = "https://news.ycombinator.com/user?id=" + author;

  const commentHtml = `
    <div class="rahn-content">
      <div class="rahn-meta">
        <a class="rahn-author" href="${authorLink}" target="_blank">${author}</a>
        <span>${dateString}</span>
        <a class="rahn-toggle" onclick="onClickToggle(this)" >[-]</a>
      </div>
      <div class="rahn-text">${commentText}</div>
    </div>
  `;
  commentDiv.insertAdjacentHTML('beforeend', commentHtml);
  // Add to parentDiv
  parentDiv.appendChild(commentDiv);
  for (const childComment of comment.children) {
    makeThread(childComment, commentDiv)
  }
}

function makeCommentsNode(post: Post) {
  let commentsRootDiv = document.createElement('div');
  commentsRootDiv.setAttribute("class", "rahn-root")
  for (const comment of post.comments) {
    makeThread(comment, commentsRootDiv)
  }

  function onClickToggle(e: any) {
    const commentDiv = e.parentElement.parentElement.parentElement;
    if (e.innerText == '[-]') {
      commentDiv.style.height = '15px';
      e.innerText = '[+]';
    } else {
      commentDiv.style.height = 'unset';
      e.innerText = '[-]';
    }
  };

  const scriptString = `<script>${onClickToggle.toString()}</script>`
  commentsRootDiv.insertAdjacentHTML('beforeend', scriptString)
  return commentsRootDiv;
}

function makeIframe(post: Post) {
  let iframe = document.createElement('iframe');

  function onIframeLoaded() {
    var doc = iframe.contentWindow.document;
    doc.open();
    const node = makeCommentsNode(Post);
    // write comments, creates html structure
    doc.write(node.outerHTML);
    // add stylesheet to iframe head
    doc.head.appendChild(getCssStyleElement())

    // doc.head.appendChild(cssLink)
    let author = post.author;
    let authorLink = post.authorLink();
    let title = post.title;
    let titleLink = post.titleLink();
    let id = post.id;
    let comments = post.comments;
    let source = post.source;

    const headerHtml = `
    <div>
      <h1 id="title">${source} Discussion: <a href="${titleLink}" target="_blank">[&#x2197;] ${title}</a></h1>
      <p id="subtitle">by <a href="${authorLink}" target="_blank">${author}</a>
      <a href="${titleLink}" target="_blank">${comments.length} comments</a>
      </p>
    </div>
    `;
    let headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'rahn-header');
    headerDiv.innerHTML = headerHtml;
    headerDiv.insertAdjacentElement('afterbegin', getSvgElement())
    doc.body.insertAdjacentElement('afterbegin', headerDiv)
    doc.close();

    // iframe.style.WebkitTransition = 'opacity 1s';
    // iframe.style.MozTransition = 'opacity 1s';
    iframe.style.height = '800px';//doc.body.scrollHeight + 'px';
    iframe.style.opacity = '1';
  }

  iframe.style.opacity = '0';
  iframe.setAttribute('name', 'rahn');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('frameBorder', '0');
  // iframe.setAttribute('scrolling', 'no');
  iframe.addEventListener('load', onIframeLoaded);
  return iframe;
}

function makeIframeError(source: string, submitLink: string) {
  let iframe = document.createElement('iframe');

  function onIframeLoaded() {
    var doc = iframe.contentWindow.document;
    doc.open();
    // write comments, creates html structure
    doc.write('<div></div>');
    // add stylesheet to iframe head
    doc.head.appendChild(getCssStyleElement())

    // doc.head.appendChild(cssLink)
    let url = window.location.href;
    let title = document.title;

    const headerHtml = `
    <div class="error">
      <p id="subtitle">No discussion found on ${source}</p>
      <p id="subtitle"><a href="${submitLink}" target="_blank">Click here start one!</p>
    </div>
    `;
    let headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'rahn-header');
    headerDiv.innerHTML = headerHtml;
    headerDiv.insertAdjacentElement('afterbegin', getSvgElement())
    doc.body.insertAdjacentElement('afterbegin', headerDiv)
    doc.close();

    // iframe.style.WebkitTransition = 'opacity 1s';
    // iframe.style.MozTransition = 'opacity 1s';
    iframe.style.height = '50px';
    iframe.style.opacity = '1';
  }

  iframe.style.opacity = '0';
  iframe.setAttribute('name', 'rahn');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.addEventListener('load', onIframeLoaded);
  return iframe;
}

export {
  makeIframe,
  makeIframeError,
}