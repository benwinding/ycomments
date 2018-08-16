// API stuff
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

function checkHnForUrl(urlString) {
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

function fetchHnComments(commentsId) {
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

  const apiUrl = `https://hn.algolia.com/api/v1/items/${commentsId}`
  return getUrlJson(apiUrl)
    .then((data) => {
      const sorted = data.children.sort(sortComments);
      return sorted;
    })
}


module.exports = {
  checkHnForUrl: checkHnForUrl,
  fetchHnComments: fetchHnComments
}