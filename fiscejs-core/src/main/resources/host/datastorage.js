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
    request = new XMLHttpRequest();
    request.open('GET', baseUrl + "/" + namespace + ".txt", true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        resp = request.responseText;
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
              console.log("Class " + key + " loaded " + value.length);
              break;
            case 1: //constants
              value = line;
              localStorage.setItem("constants", value);
              console.log("Constants loaded " + value.length);
              break;
            case 2: //strings
              value = line;
              localStorage.setItem("strings", value);
              console.log("Strings loaded " + value.length);
              break;
            case 3: //code
              value = line;
              localStorage.setItem("code", value);
              console.log("Code loaded " + value.length);
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
              console.log("File " + key + " loaded " + value.length);
              break;
          }
        }

        localStorage.setItem("loaded", "true");
        doSend(targetWindow);
      } else {
        targetWindow.postMessage({
          hash: hash,
          op: "error",
          value: "Connection error: " + request.status
        }, "*");
      }
    };

    request.onerror = function() {
      targetWindow.postMessage({
        hash: hash,
        op: "error",
        value: "Connection error: " + request.status
      }, "*");
    };

    request.send();
  }
  /**
   * @param {Window} target
   */
  function doSend(target) {
    target.postMessage({
      hash: hash,
      op: "begin"
    }, "*");
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
      op: "done"
    }, "*");
  }
}