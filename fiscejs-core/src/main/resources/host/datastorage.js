/**
@param {Window} targetWindow
@param {string} namespace
@param {string} baseUrl
*/
function sendData(targetWindow, hash, namespace, baseUrl) {
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

  baseUrl = baseUrl || "";

  if (localStorage.getItem("loaded") == "true" && !window.location.hostname.substring(0, 7) == "latest.") {
    doSend(targetWindow);
  } else {
    (function() {

      /**
       * @param  {[type]} event [description]
       */
      function onProgress(event) {
        targetWindow.postMessage({
          hash: hash,
          op: "loadProgress",
          value: event.loaded + "/" + event.total
        }, "*");
      }

      function onError(event) {
        targetWindow.postMessage({
          hash: hash,
          op: "loadError",
          value: "Connection error: " + event.currentTarget.status
        }, "*");
      };

      function onSuccess(event) {
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
              case 3: //code
                value = line;
                localStorage.setItem("code", value);
                break;
              case 4: //files
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
          targetWindow.postMessage({
            hash: hash,
            op: "loadSuccess"
          }, "*");
          localStorage.setItem("loaded", "true");
          doSend(targetWindow);
        } else {
          onError(event);
        }
      };



      targetWindow.postMessage({
        hash: hash,
        op: "loadStart"
      }, "*");

      request = new XMLHttpRequest();
      request.open('GET', baseUrl + "/" + namespace + ".txt", true);
      request.addEventListener("progress", onProgress, false);
      request.addEventListener("load", onSuccess, false);
      request.addEventListener("error", onError, false);
      request.addEventListener("abort", onError, false);
      request.send();
    })();
  }
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
        } else if (key == "code") {
          target.postMessage({
            hash: hash,
            op: "code",
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
}