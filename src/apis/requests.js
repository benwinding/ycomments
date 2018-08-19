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
  getUrl: getUrl,
  stripUrl: stripUrl,
  isMatchTwoUrls: isMatchTwoUrls,
} 