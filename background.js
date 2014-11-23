/*
chrome.browserAction.onClicked.addListener(function(activeTab) {
  var appURL = "app.html";
  console.log(chrome.extension.getURL(appURL));
  chrome.tabs.create({"url": chrome.extension.getURL(appURL)});
});
*/
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('app.html', {
    width: 400,
    height: 500,
    type: 'shell',
    id: 'appMainWindow',
    singleton: true
  },function(appWindow) {
  });
});