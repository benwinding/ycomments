const r = require('./requests.js')

function checkRedditForUrl(urlString) {
  const location = new URL(urlString);
  let initurl = location.href;
  let search_url = encodeURIComponent("url:" + initurl)
  let requestUrl = "https://old.reddit.com/search?sort=top&q=" + search_url

  return r.getUrl({
    url: requestUrl,
    json: false,
  })
  .then((response) => {
      let html = $($.parseHTML(response.data))
      let searchResultsComments = html.find('a.search-comments')
      if (searchResultsComments.length == 0) {
        return Promise.reject('Reddit API: No results found');
      }
      let firstCommentsLink = searchResultsComments[0]
      let commentTextArr = firstCommentsLink.text.split(" ");
      let num_of_comments = commentTextArr.length > 1 ? commentTextArr[0] : 0;

      firstCommentsLink.hostname = 'reddit.com'
      // return {
      //   id: result_id,
      //   link: linkUrl,
      //   comments: num_of_comments,
      //   title: result_title,
      //   author: result_author,
      // }
      return {
        link: firstCommentsLink.href,
        comments: num_of_comments
      }
    }).catch((err) => {
      return Promise.reject(err);
    })
}

function fetchRedditComments(postId) {

}

module.exports = {
  checkRedditForUrl: checkRedditForUrl,
  fetchRedditComments: fetchRedditComments,
}