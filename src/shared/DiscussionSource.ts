interface DiscussionSource {
  check(pageUrl: string);
  fetchComments(postId: string);
  getErrorIframe(pageUrl: string, pageTitle: string);
  getCommentsIframe(postId: string);
}