class PostComment {
  id: string;
  author: string;
  text: string;
  time: string;
  children: PostComment[];
  constructor() {
    this.children = [];
  }
}