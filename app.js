/**
 * Copyright 2014-2015 daiz, Draftnote project.
 * Code licensed under the MIT License.
 * Documentation licensed under CC BY 3.0.
 */

/* tools */
String.prototype.format = function() {
  var str = this.toString();
  var args = arguments;
  // {} の個数を確認
  var len_blanks = (str.match(/\{\}/g) || []).length;
  // 引数の個数を確認
  var len_args = args.length;
  // 個数が一致しない場合は文字列をそのまま返す
  if(len_args != len_blanks) return str;
  // 個数が一致していれば置換作業を行う
  for(var i=0; i < args.length; i++) {
    str = str.replace(/\{\}/, args[i]);
  }
  return str;
}

/* app main object */
var app = app || {};

/* top level */
app.root = function() {
  return document;
};

/* main template tag */
app.stage = function() {
  return app.root().querySelector('#stage');
};

/* count and display char length */
app.count_char = function() {
  var box_area = document;//app.stage();
  var textboxs = box_area.getElementsByClassName('editor');
  for(var i = 0; i < textboxs.length; i++) {
    var rows = textboxs[i].value.split('\n').length;
    var text = textboxs[i].value.replace(/\n/gi, '');
    app.stage().textboxs[i].rows = rows + 1;
    app.stage().textboxs[i].char_nums = text.length;
  }
}

/* create a blank edit box */
app.insert_new_editbox = function(msg) {
  var box_area = app.stage();
  box_area.textboxs = box_area.textboxs || [];
  /* Only when there is no box of its number of characters 0,
     add a new box */
  var flag = 1;
  for(var i = 0; i < box_area.textboxs.length; i++) {
    if(box_area.textboxs[i].char_nums === 0) {
      flag = 0;
      break;
    }
  }
  if(flag === 1) {
    msg = msg || '新しいメモ';
    box_area.textboxs.push({
      "content": msg,
      "char_nums": msg.length,
      "btn_link": '#cecece',
      "urls": [],
      "tool_detail": '',
      "tool_detail_show": 'none',
      "runtime_id": box_area.textboxs.length,
      "rows": msg.split('\n').length + 1
    });
  }
  return;
}

/* Backup user dara of ver 0.0.1
 * アプリのアップデートに伴う移行作業のためのバックアップ機能
 */
app.memoBackUpStoreKey = 'UserBkp1';
app.memoBackUpTargetKey = 'UserMemo';
app.save_to_bkp_storage = function(callback) {
  appStorage(app.memoBackUpStoreKey, "get", function(ee) {
    if(ee[app.memoBackUpStoreKey] == undefined) {
      /* get from storage of 0.0.1 */
      appStorage(app.memoBackUpTargetKey, "get", function(e) {
        if(e[app.memoBackUpTargetKey] != undefined) {
          /* バックアップを行う */
          appStorage({"key": app.memoBackUpStoreKey, "value": e[app.memoBackUpTargetKey]}, "set", function(e) {
            console.info('Backup: successfully saved.');
            callback();
          });
        }else {
          /* 空のバックアップ領域を生成する */
          console.info('Backup: pass (no "{}")'.format(app.memoBackUpTargetKey));
          appStorage({"key": app.memoBackUpStoreKey, "value": ""}, "set", function(e) {
            console.info('Backup: successfully saved.');
            callback();
          });
        }
      });
    }else {
      /* 新たなバックアップな場合はスキップする */
      console.info('Backup: pass (already exists "{}")'.format(app.memoBackUpStoreKey));
      callback();
    }
  });
}

/* Store memos */
app.memoStoreKey2 = 'UserMemo';
app.memoDivLine = '--**--**--';
app.sava_to_storage = function() {
  var memo = '';
  var box_area = document;
  var textboxs = box_area.getElementsByClassName('editor');
  for(var i = 0; i < textboxs.length; i++) {
    var memo = memo + app.memoDivLine + textboxs[i].value;
  }
  appStorage({"key": app.memoStoreKey2, "value": memo}, "set", function(e) {
    console.log("Saved locally.");
  });
};

/* Restore memos */
app.restore_from_storage = function() {
  appStorage(app.memoStoreKey2, "get", function(e) {
    if(e[app.memoStoreKey2] === undefined) {
      console.log("No stored user data.");
      app.insert_new_editbox();
    }else {
      console.log("Got user memos.");
      var memos = e[app.memoStoreKey2].split(app.memoDivLine);
      for(var j = 0; j < memos.length; j++) {
        if(memos[j] != '') {
          app.insert_new_editbox(memos[j]);
        }
      }
    }
  });
}

app.hasURL = function(){
  var box_area = document;
  var textboxs = box_area.getElementsByClassName('editor');
  for(var j = 0; j < textboxs.length; j++) {
    var text = textboxs[j].value;
    var urls = text.match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/g) || [];
    var res = [];
    for(var i=0; i < urls.length; i++) {
      var url = urls[i];
      var u = {};
      u.text = url.replace(/^https?:\/\//, '');
      u.full = url;
      res.push(u);
    }
    if(res.length > 0) {
      app.stage().textboxs[j].urls = res;
      app.stage().textboxs[j].btn_link = '#7986cb';
    }else {
      app.stage().textboxs[j].urls = [];
      app.stage().textboxs[j].btn_link = '#cecece!important';
      app.stage().textboxs[j].tool_detail_show = 'none';
    }
  }
}

/* Event Listeners */
window.addEventListener('load', function(e) {
  app.save_to_bkp_storage(app.restore_from_storage);
}, false);

window.addEventListener('keyup', function(e) {
  app.sava_to_storage();
  app.count_char();
  app.hasURL();
}, false);

window.addEventListener('click', function(e) {
  var id = e.target.id;
  var cn = e.target.className;
  if(id === 'btn_requast_new_editbox') {
    console.log(id);
    app.insert_new_editbox();
  }
  else if(cn == "toolbtn lb") {
    var box_area = app.stage();
    var idx = id.split('_');
    idx = +(idx[idx.length - 1]);
    console.log(idx);
    var box = box_area.textboxs[idx];
    if(box.urls.length > 0) {
      if(app.stage().textboxs[idx].tool_detail_show == 'none') {
        app.stage().textboxs[idx].tool_detail_show = 'block';
      }else {
        app.stage().textboxs[idx].tool_detail_show = 'none';
      }
      var a_tags = '';
      for(var j = 0; j < box.urls.length; j++) {
        var a_tag = '<a href="{}" target="_blank">{}</a><br>'.format(box.urls[j].full, box.urls[j].text);
        a_tags += a_tag;
      }
      document.querySelector('#tooldetail_' + idx).innerHTML = a_tags;
    }else {
      app.stage().textboxs[idx].tool_detail_show = 'none';
    }
  }
}, false);
