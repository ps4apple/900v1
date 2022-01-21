/**
 * Small version of jQuery for easy
 * selecting elements from the DOM
 
 * @author Jan Biasi
 * @version  1.0.1
 * @license MIT
 *
 * @param  {string} selector    CSS selector
 * @return {object}             Single or multiple DOM Nodes
 */
const $ = (selector, root = document) => {
  const matches = {
    "#": "getElementById",
    ".": "getElementsByClassName",
    "@": "getElementsByName",
    "=": "getElementsByTagName",
    "?": "querySelectorAll",
  };
  const rex = /[?=#@.*]/.exec(selector)[0];
  const nodes = root[matches[rex]](selector.split(rex)[1]);
  if (nodes.length == 1) {
    return nodes[0];
  }
  return nodes;
};

const notify = (text, level = 0, delay = 0) => {
  const notifyLevel = { 0: "", 1: " -error" };
  setTimeout(() => {
    $(
      "?.xhost__notification-container"
    ).innerHTML = `<div class="xhost__notification ${notifyLevel[level]}">${text}</div>`;
  }, delay);

  setTimeout(() => {
    $("?.xhost__notification-container").innerHTML = "";
  }, delay + 5000);
};

if (window.applicationCache) {
  window.applicationCache.addEventListener(
    "updateready",
    (e) => {
      if (
        window.applicationCache.status == window.applicationCache.UPDATEREADY
      ) {
        notify("캐쉬가 업데이트됨<br/>RELOADING", 1);
        setTimeout(() => {
          window.location.reload();
        }, 3001);
      }
    },
    false
  );

  window.applicationCache.ondownloading = () => {
    $(".xhost__cache").style.display = "block";
    notify("캐쉬를 시작함", 1);
  };

  window.applicationCache.onprogress = (a) => {
    let w = Math.round(100 * (a.loaded / a.total));
    if (w > 100 || isNaN(w)) {
      w = 100;
    }
    $(".xhost__payload-autoload-bar").style.width = w + "%";
  };

  window.applicationCache.oncached = () => {
    $(".xhost__cache").style.display = "none";
    notify("캐쉬가 완료됨", 1);
  };
}
