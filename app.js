// リアルタイムでローカルストレージに保存する
window.addEventListener('keyup', function(e) {
  var memo = document.getElementById('b').innerText;
  appStorage({"key": "UserMemo", "value": memo}, "set", function(e) {
    console.log("Saved locally.");
  });
}, false);

// ページのロードが完了したら実行すること
window.addEventListener('load', function() {

  appStorage("UserMemo", "get", function(e) {
    console.log("Got user memos.");
    if(e.UserMemo === undefined) {
      e.UserMemo = "さあ、ここからメモを始めましょう";
    }
    document.getElementById('b').innerText = e.UserMemo;
  });

}, false);