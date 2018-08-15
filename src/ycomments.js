var ycomments = (function() {
  function getUrlJson(url) {
    return new Promise((resolve, reject) => {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (this.readyState != 4)
          return;
        if (this.status != 200)
          reject(this.statusText)
        var data = JSON.parse(this.responseText);
        resolve(data)
      };
      xmlhttp.open("GET", url, true);
      xmlhttp.send(null);
    })
  }

  function stripUrl(urlString) {
    const url = new URL(urlString);
    return url.host + url.pathname + url.search
  }

  function isMatchTwoUrls(url1, url2) {
    return (stripUrl(url1) == stripUrl(url2));
  }

  function fetchHn(urlString) {
    const location = new URL(urlString);
    const inithost = location.host;
    const omitlist = ['news.ycombinator.com'];
    if (omitlist.indexOf(inithost) >= 0) {
      return Promise.reject('Hacker News API: Not going to search domain: Hacker News');
    }
    let initurl = location.href;
    let search_url = encodeURIComponent(stripUrl(initurl))

    let requestUrl = "https://hn.algolia.com/api/v1/search?query=" + search_url + "&restrictSearchableAttributes=url"
    var xhttp = new XMLHttpRequest();

    function processJsonResponse(data) {
      if (data["nbHits"] == 0) {
        return Promise.reject('Hacker News API: No urls found');
      }
      let allhits = data["hits"];
      let num_of_comments = 0;
      let hitMatch
      for (let hit of allhits) {
        if (isMatchTwoUrls(hit["url"], initurl) && hit["num_comments"] >= num_of_comments) {
          num_of_comments = hit["num_comments"];
          hitMatch = hit;
        }
      }
      if (hitMatch == null)
        return Promise.reject('Hacker News API: No url matches found');

      result_id = hitMatch["objectID"];
      result_title = hitMatch["title"];
      result_author = hitMatch["author"];

      const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`
      return {
        id: result_id,
        link: linkUrl,
        comments: num_of_comments,
        title: result_title,
        author: result_author,
      }
    }

    return getUrlJson(requestUrl)
    .then((data) => {
      return processJsonResponse(data)
    }).catch((err) => {
      return Promise.reject(err);
    })
  }

  function sortComments(a,b) {
    if (a.children.length > b.children.length)
      return -1;
    if (a.children.length < b.children.length)
      return 1;

    if (a.created_at > b.created_at)
      return -1;
    if (a.created_at < b.created_at)
      return 1;

    return 0;
  }

  function fetchHnComments(postId) {
    const apiUrl = `https://hn.algolia.com/api/v1/items/${postId}`
    return getUrlJson(apiUrl)
      .then((data) => {
        const sorted = data.children.sort(sortComments);
        return sorted;
      })
  }

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
    let resultJson;
    return fetchHn(thisUrl)
      .then((result) => { 
        resultJson = result;
        return fetchHnComments(result.id)
      })
      .then((comments) => {
        const node = makeCommentsNode(comments);
        return {
          'node': node,
          'results': resultJson
        }
      })
      .catch((err) => console.error(err))
  }

  return {
    getHnCommentsNode: getHnCommentsNode
  }
}())

function onLoad() {
  // let thisUrl = 'http://www.youtube.com/watch?v=oVfHeWTKjag'; 
  let thisUrl = window.location.href; 
  ycomments.getHnCommentsNode(thisUrl)
    .then((comments) => {
      let iframe = document.createElement('iframe');

      function onIframeLoaded() {
        var doc = iframe.contentWindow.document;
        doc.open();
        // write comments, creates html structure
        doc.write(comments.node.outerHTML);
        // add stylesheet to iframe head
        var cssTag = document.createElement("style");
        cssTag.innerText = `
html, body {
  left: 0px;
  right: 0px;
  margin-left: 0px;
  width: 100% !important;
  display: block !important;
  background-color: #f6f6ef;
  font-family: Verdana, Geneva, sans-serif;
}

.ycomments-root {
  width: 100%;
  margin-left: -10px;
}

.ycomments-header {
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
}

.ycomments-header h1 a,
.ycomments-header h1 {
  font-size: 12pt;
  color: black;
  margin-bottom: 6px;
}

.ycomments-header h1 a:visited {
  color: grey;
}

.ycomments-header p a,
.ycomments-header p {
  font-size: 10pt;
  color: grey;
  padding: 0;
  margin-top: 0;
  margin-right: 6px;
}

.ycomments-child {
  margin-left: 10px;
  padding: 10px;
  padding-top: 5px;
  right: 0px;
  left: 0px;
  position: relative;
  font-size: 9pt;
}

.ycomments-content {
  margin-bottom: -10px;
}

.ycomments-content a:hover {
  text-decoration: underline;
  cursor: pointer;
}

.ycomments-meta, .ycomments-author {
  color: grey;
}

.ycomments-author {
  margin-right: 7px;
}

.ycomments-child p {
  margin-top: 5px;
}

.ycomments-child pre {
  color: black;
  overflow-x: scroll;
  background-color: #f7f7f7;
}

        `
        doc.head.appendChild(cssTag)

        // var cssLink = document.createElement("link");
        // cssLink.href = "ycomments.css"; 
        // cssLink.rel = "stylesheet"; 
        // cssLink.type = "text/css"; 
        // doc.head.appendChild(cssLink)
        let author = comments.results.author;
        let authorLink = "https://news.ycombinator.com/user?id="+author;
        let title = comments.results.title;
        let id = comments.results.id;
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

      let ycommentsRoot = document.querySelector('[from="hn"]');
      ycommentsRoot.appendChild(iframe)
    })
    .catch((err) => console.error(err))
}

window.addEventListener('load', onLoad)
