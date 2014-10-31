/**
@param {string} url
@param {function} callback
*/
function loadData(url, callback) {
  var request;

  /**
   * @param  {[type]} event [description]
   */
  function onProgress(event) {
    callback("loadProgress", event.loaded + "/" + event.total);
  }

  function onError(event) {
    callback("loadError", "Connection error: " + event.currentTarget.status);
  };

  function onSuccess(event) {
    var resp, len, idx, line, pos = 0,
      mode = 0,
      splitter, key, value;
    if (event.currentTarget.status >= 200 && event.currentTarget.status < 400) {
      resp = event.currentTarget.responseText;
      // parse
      len = resp.length;
      while (pos < len) {
        idx = resp.indexOf("\n", pos);
        if (idx < 0) {
          idx = pos.len;
        }

        line = resp.substring(pos, idx);
        pos = idx + 1;
        if (line.length === 0) {
          //blank line, change process mode
          mode++;
          continue;
        }
        switch (mode) {
          case 0: //classes
            splitter = line.indexOf("\0");
            if (splitter < 0 || splitter >= line.length - 1) {
              key = line;
              value = "";
            } else {
              key = line.substring(0, splitter);
              value = line.substring(splitter + 1);
            }
            localStorage.setItem("c:" + key, value);
            break;
          case 1: //constants
            value = line;
            localStorage.setItem("constants", value);
            break;
          case 2: //strings
            value = line;
            localStorage.setItem("strings", value);
            break;
          case 3: //files
            splitter = line.indexOf("\0");
            if (splitter < 0 || splitter >= line.length - 1) {
              key = line;
              value = "";
            } else {
              key = line.substring(0, splitter);
              value = line.substring(splitter + 1);
            }
            localStorage.setItem("f:" + key, value);
            break;
        }
      }
      localStorage.setItem("loaded", "true");
      callback("loadSuccess");
    } else {
      onError(event);
    }
  };


  callback("loadStart");

  request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.addEventListener("progress", onProgress, false);
  request.addEventListener("load", onSuccess, false);
  request.addEventListener("error", onError, false);
  request.addEventListener("abort", onError, false);
  request.send();
};

function getClassDef(name) {
  return localStorage.getItem("c:" + name);
}

function getFile(name) {
  return localStorage.getItem("f:" + name);
}

function getStrings() {
  return localStorage.getItem("strings");
}

function getConstants() {
  return localStorage.getItem("constants");
}

/**
@param {Window} targetWindow
@param {string} hash
@param {string} url
*/
function sendDataByMessage(targetWindow, hash, url) {
  "use strict";
  var classMatcher = /^c\:(.*)$/;
  var fileMatcher = /^f\:(.*)$/;

  var request;
  var resp;
  var len;
  var pos = 0;
  var idx;
  var line;
  var mode = 0;
  var splitter;
  var key;
  var value;

  console.log("sendDataByMessage: ", Array.prototype.join.call(arguments, ", "));

  /**
   * @param {Window} target
   */
  function doSend(target) {
    target.postMessage({
      hash: hash,
      op: "start"
    }, "*");
    try {
      for (var i = 0, max = localStorage.length; i < max; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        var matcher;
        if (matcher = classMatcher.exec(key)) {
          target.postMessage({
            hash: hash,
            op: "class",
            value: value,
            name: matcher[1]
          }, "*");
        } else if (matcher = fileMatcher.exec(key)) {
          target.postMessage({
            hash: hash,
            op: "file",
            value: value,
            name: matcher[1]
          }, "*");
        } else if (key == "strings") {
          target.postMessage({
            hash: hash,
            op: "strings",
            value: value
          }, "*");
        } else if (key == "constants") {
          target.postMessage({
            hash: hash,
            op: "constants",
            value: value
          }, "*");
        }
      }
      target.postMessage({
        hash: hash,
        op: "success"
      }, "*");
    } catch (e) {
      target.postMessage({
        hash: hash,
        op: "error"
      }, "*");
    }
  }

  if (localStorage.getItem("loaded") == "true" && !window.location.hostname.substring(0, 7) == "latest.") {
    doSend(targetWindow);
  } else {
    loadData(url, function(op, value) {
      targetWindow.postMessage({
        hash: hash,
        op: op,
        value: value
      }, "*");
      if (op === "loadSuccess") {
        doSend(targetWindow);
      }
    });
  }
}