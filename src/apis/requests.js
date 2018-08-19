function getUrl2(options) {
  return new Promise((resolve, reject) => {
    var createCORSRequest = function(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // Most browsers.
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {
        // IE8 & IE9
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        // CORS not supported.
        xhr = null;
      }
      return xhr;
    };

    var url = 'https://old.reddit.com';
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

    xhr.onload = function() {
      // Success code goes here.
      resolve(data)
    };

    xhr.onerror = function(err) {
      // Error code goes here.
      reject(err)
    };

    xhr.send();
  })
}

function getUrl(options) {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (this.readyState != 4)
        return;
      if (this.status != 200)
        reject(this.statusText)
      if (options.json)
        resolve(JSON.parse(this.responseText))   
      else
        resolve(this.responseText)
    };
    xmlhttp.open("GET", options.url, true);
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

module.exports = {
  getUrl: getUrl2,
  stripUrl: stripUrl,
  isMatchTwoUrls: isMatchTwoUrls,
} 