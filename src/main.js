require('./main.css')

function onLoadYcomments() {
  let ycommentsRoot = document.querySelector('div[comments]');
  let itemValue = ycommentsRoot.getAttribute('comments');
  let getIdPromise;  
  if (itemValue == 'auto') {
    // let thisUrl = window.location.href; 
    let thisUrl = 'http://www.youtube.com/watch?v=oVfHeWTKjag'; 
    getIdPromise = function () { 
      return ycomments.fetchHn(thisUrl)
        .then((res) => {return res.id})
    }
  }
  else  { 
    getIdPromise = function () {
      return Promise.resolve(itemValue);
    }
  }

  getIdPromise()
    .then((commentsId) => ycomments.getHnCommentsNode(thisUrl))
    .then((comments) => {
      let iframe = makeIframe(comments);
      ycommentsRoot.appendChild(iframe);
    })
    .catch((err) => console.error(err))
}

window.addEventListener('load', onLoadYcomments)
