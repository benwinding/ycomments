class Post {
  comments: Comments[];
  source: string;
  linkUrl: string;
  time: string;
  title: string;
  id: string;
  author: string;

  titleLink(): string {
    return `https://hn.titleLink${this.id}`;
  }
  authorLink(): string {
    return `https://hn.authorLink${this.author}`;
  }
  constructor() {
    this.comments = [];
  }
}