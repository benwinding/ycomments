import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from "axios";

const html = require('./shared/html-builder')

function stripUrl(urlString: string) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search
}

function isMatchTwoUrls(url1: string, url2: string) {
  return (stripUrl(url1) == stripUrl(url2));
}

function checkHnForUrl(urlString: string): Promise<Post> {
  const location = new URL(urlString);
  let initurl = location.href;
  let search_url = encodeURIComponent(stripUrl(initurl))

  var xhttp = new XMLHttpRequest();

  function processJsonResponse(data: any) {
    if (data["nbHits"] == 0) {
      return Promise.reject('Hacker News API: No posts found matching url:'+urlString);
    }
    let allhits = data["hits"];
    let num_of_comments = 0;
    let hitMatch: any;
    for (let hit of allhits) {
      if (isMatchTwoUrls(hit["url"], initurl) && hit["num_comments"] >= num_of_comments) {
        num_of_comments = hit["num_comments"];
        hitMatch = hit;
      }
    }
    if (hitMatch == null)
      return Promise.reject('Hacker News API: No url found matching:'+urlString);

    const result_id = hitMatch["objectID"];
    let post = new Post();
    post.linkUrl = `https://news.ycombinator.com/item?id=${result_id}`;
    post.id = result_id;
    post.title = hitMatch["title"];
    post.author = hitMatch["author"];
    return post;
  }

  let requestUrl = "https://hn.algolia.com/api/v1/search?query=" + search_url + "&restrictSearchableAttributes=url"
  return axios.get(requestUrl)
    .then((response: AxiosResponse) => { 
      let post = processJsonResponse(response.data);
      return Promise.resolve(post);
    })
    .catch((err: AxiosError) => Promise.reject(err))
}

export function fetchHnComments(commentsId: string) {

  function makeCommentTree(rawComments: any): PostComment[] {
    let comments: PostComment[] = [];
    for (let rawComment of rawComments) {
      let currentComment = new PostComment();
      currentComment.text = rawComment.text;
      currentComment.time = rawComment.created_at;
      currentComment.author = rawComment.author;
      currentComment.id = rawComment.id;
      comments.push(currentComment);
      if (rawComment.children.length > 0) {
        currentComment.children = makeCommentTree(rawComment.children);
      }
    }
    return comments;
  }

  function sortComments(a: PostComment, b: PostComment) {
    if (a.children.length > b.children.length)
      return -1;
    if (a.children.length < b.children.length)
      return 1;

    if (a.time > b.time)
      return -1;
    if (a.time < b.time)
      return 1;

    return 0;
  }

  const apiUrl = `https://hn.algolia.com/api/v1/items/${commentsId}`
  return axios.get(apiUrl)
    .then((response: AxiosResponse) => {
      const data = response.data;
      let comments: PostComment[] = makeCommentTree(data.children);
      let sorted = comments.sort(sortComments);
      let post = new Post();
      post.id = data.id;
      post.title = data.title;
      post.author = data.author;
      post.time = data.created_at;
      post.linkUrl = data.url;
      post.comments = sorted;
      return post;
    })
}

export class HackerNews implements DiscussionSource {
  check(pageUrl: string) {
    return checkHnForUrl(pageUrl);
  }
  fetchComments(postId: string) {
    return fetchHnComments(postId);
  }
  getErrorIframe(pageUrl: string, pageTitle: string) {
    let submitlink = `https://news.ycombinator.com/submitlink?u=${pageUrl}&t=${pageTitle}`;
    return html.makeIframeError('Reddit', submitlink);
  }
  getCommentsIframe(postId: string) {
    postObj.meta.authorLink = "https://news.ycombinator.com/user?id=" + postObj.meta.author;
    postObj.meta.titleLink = "https://news.ycombinator.com/item?id=" + postObj.meta.id;

    return html.makeIframe('Reddit', postObj.comments, postObj.meta);
  }
}