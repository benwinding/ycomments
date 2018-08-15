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
      let result_id = null;
      for (let hit of allhits) {
        if (isMatchTwoUrls(hit["url"], initurl) && hit["num_comments"] >= num_of_comments) {
          num_of_comments = hit["num_comments"];
          result_id = hit["objectID"];
        }
      }
      if (result_id == null) {
        return Promise.reject('Hacker News API: No url matches found');
      }
      const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`
      return {
        id: result_id,
        link: linkUrl,
        comments: num_of_comments
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
          <a class="ycomments-toggle" onclick="onClickToggle(this)" >[+]</a>
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
      if (e.innerText == '[+]') {
        commentDiv.style.height = '10px'
        e.innerText = '[-]'        
      }
      else {
        commentDiv.style.height = 'unset'
        e.innerText = '[+]'
      }
    };
    
    const scriptString = `<script>${onClickToggle.toString()}</script>`
    commentsRootDiv.insertAdjacentHTML('beforeend', scriptString)
    return commentsRootDiv;
  }

  function getHnCommentsNode() {
    let thisUrl = 'http://www.youtube.com/watch?v=oVfHeWTKjag'; //window.location.href;
    return fetchHn(thisUrl)
      .then((result) => fetchHnComments(result.id))
      .then((comments) => {
        return makeCommentsNode(comments)
      })
      .catch((err) => console.error(err))
  }

  return {
    getHnCommentsNode: getHnCommentsNode
  }
}())

function onLoad() {
  let thisUrl = 'http://www.youtube.com/watch?v=oVfHeWTKjag'; //window.location.href; 
   
  ycomments.getHnCommentsNode(thisUrl)
    .then((commentsNode) => {
      let iframe = document.createElement('iframe');

      function onIframeLoaded() {
        var doc = iframe.contentWindow.document;
        doc.open();
        // write comments, creates html structure
        doc.write(commentsNode.outerHTML);
        // add stylesheet to iframe head
        var cssLink = document.createElement("link");
        cssLink.href = "ycomments.css"; 
        cssLink.rel = "stylesheet"; 
        cssLink.type = "text/css"; 
        doc.head.appendChild(cssLink)

        iframe.style.height = doc.body.scrollHeight + 'px';

        doc.close();
      }
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
