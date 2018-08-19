const r = require('./requests.js')

function checkHnForUrl(urlString) {
  const location = new URL(urlString);
  let initurl = location.href;
  let search_url = encodeURIComponent(r.stripUrl(initurl))

  let requestUrl = "https://hn.algolia.com/api/v1/search?query=" + search_url + "&restrictSearchableAttributes=url"
  var xhttp = new XMLHttpRequest();

  function processJsonResponse(data) {
    if (data["nbHits"] == 0) {
      return Promise.reject('Hacker News API: No posts found matching url:'+urlString);
    }
    let allhits = data["hits"];
    let num_of_comments = 0;
    let hitMatch
    for (let hit of allhits) {
      if (r.isMatchTwoUrls(hit["url"], initurl) && hit["num_comments"] >= num_of_comments) {
        num_of_comments = hit["num_comments"];
        hitMatch = hit;
      }
    }
    if (hitMatch == null)
      return Promise.reject('Hacker News API: No url found matching:'+urlString);

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

  return r.getUrl({
    url: requestUrl,
    json: true,
  })
    .then((data) => processJsonResponse(data))
    .catch((err) => Promise.reject(err))
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
  return r.getUrlJson(apiUrl)
    .then((data) => {
      const sorted = data.children.sort(sortComments);
      return {
        meta: {
          id: data.id,
          title: data.title,
          author: data.author,
          created_at: data.created_at,
          url: data.url
        },
        comments: sorted
      };
    })
}

module.exports = {
  checkHnForUrl: checkHnForUrl,
  fetchHnComments: fetchHnComments,
}