const $hostMain = $(".xhost__main");
const $hostIntro = $(".xhost__intro");

let activeMenuIdx = 1;
let activeSubmenuIndex = 0;
let initialMenu = true;
let initialMenuActiveMenuIdx = 0;
let menu;
let menuKeys;
let menuLength;
let rows;

const loadMenu = () => {
  return fetch("menu.json")
    .then((r) => r.json())
    .then((m) => {
      menu = m;
      return m;
    });
};

const getIntroSelectables = () => {
  return Array.from($("?.xhost__intro-select")).filter(
    (el) => el.getAttribute("hidden") != ""
  );
};

const xhostMouseUp = () => {
  if (initialMenu) {
    switch (initialMenuActiveMenuIdx) {
      case 0:
        gotoKernelExploit();
        break;
      case 1:
        initialMenu = false;
        $hostMain.style.opacity = 0;
        $hostIntro.setAttribute("hidden", "");
        $hostMain.removeAttribute("hidden");
        document.body.webkitRequestFullscreen();
        setTimeout(() => {
          $hostMain.style.opacity = 1;
        }, 1000);
        break;
      case 2:
        window.location.href = "index-cached.html";
        break;
    }

    return;
  }

  const targetEl = menu[menuKeys[activeMenuIdx]].items[activeSubmenuIndex];

  if (targetEl.action) {
    notify(`Running Payload: ${targetEl.name}`);

    setTimeout(() => {
      const { action, actionParams } = targetEl;
      actions["action__" + action].call(null, actionParams);
    }, 250);

    return;
  }
};

document.addEventListener("mouseup", xhostMouseUp);
document.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (initialMenu) {
    switch (e.keyCode) {
      case 37: // left
        initialMenuActiveMenuIdx -= 1;
        if (initialMenuActiveMenuIdx < 0) {
          initialMenuActiveMenuIdx = 0;
        }
        break;
      case 39: // right
        initialMenuActiveMenuIdx += 1;
        if (initialMenuActiveMenuIdx >= getIntroSelectables().length) {
          initialMenuActiveMenuIdx = getIntroSelectables().length - 1;
        }
        break;
    }
    renderIntroMenu();
    return;
  }

  switch (e.keyCode) {
    case 37: // left
      activeSubmenuIndex -= 1;
      if (activeSubmenuIndex < 0) {
        activeSubmenuIndex = 0;
      }
      break;
    case 39: // right
      activeSubmenuIndex += 1;
      if (activeSubmenuIndex >= menu[menuKeys[activeMenuIdx]].items.length) {
        activeSubmenuIndex = menu[menuKeys[activeMenuIdx]].items.length - 1;
      }
      break;
    case 38: // up
      activeMenuIdx -= 1;
      if (activeMenuIdx < 0) {
        activeMenuIdx = rows.length - 1;
      }
      activeSubmenuIndex = 0;
      break;
    case 40: // down
      activeMenuIdx += 1;
      if (activeMenuIdx > rows.length - 1) {
        activeMenuIdx = 0;
      }
      activeSubmenuIndex = 0;
      break;
  }
  renderMenu();
});

const generateMenu = () => {
  const outputHTML = Object.keys(menu)
    .filter((key) => {
      if (SHOW_OFFLINE_ITEMS) {
        return true;
      }
      return menu[key].hideOffline !== true;
    })
    .reduce((acc, key, idx) => {
      const items = menu[key].items
        .filter((item) => {
          if (SHOW_OFFLINE_ITEMS) {
            return true;
          }
          return item.hideOffline !== true;
        })
        .map((item) => {
          return `<button class="xhost__button xhost__button__payload ${
            menu[key].smallButtons ? "xhost__button__small" : ""
          }"><div>${item.name}</div><div class="xhost-payload__desc">${
            item.desc ? item.desc : ""
          }</div></button>`;
        })
        .join("");
      return `${acc}<section row="${idx}" ${
        idx === activeMenuIdx ? "" : "disabled"
      } class="${
        idx === activeMenuIdx ? "active" : ""
      }"><button active class="xhost__button xhost__button__menu xhost__button__secondary xhost__button__payload"><div>${key}</div></button><div class="xhost__selectable-items">${items}</div></section>`;
    }, "");

  $(".section-container").innerHTML =
    $(".section-container").innerHTML + outputHTML;
  rows = $(`?[row]`);
};

const renderIntroMenu = () => {
  getIntroSelectables().forEach((el) => {
    el.removeAttribute("active");
  });
  getIntroSelectables()[initialMenuActiveMenuIdx].setAttribute("active", "");
  getIntroSelectables()[initialMenuActiveMenuIdx].scrollIntoView();
};

const renderMenu = () => {
  rows.forEach((e) => {
    e.setAttribute("disabled", "");
    e.classList.remove("active");
  });
  const activeRow = $(`?[row="${activeMenuIdx}"]`);
  activeRow.removeAttribute("disabled");
  activeRow.classList.add("active");

  $("?.xhost__selectable-items button").forEach((el) => {
    el.removeAttribute("active");
  }, rows[activeMenuIdx]);

  const target = $("?.xhost__selectable-items button", rows[activeMenuIdx])[
    activeSubmenuIndex
  ];
  target.setAttribute("active", "");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
};

const gotoKernelExploit = () => {
  notify("Loading GoldHen2b2...");
  $(".iframe").contentWindow.action__postBinaryPayload(`src/pl/goldhen2b2.bin`);
};

loadMenu().then(() => {
  menuKeys = Object.keys(menu);
  menuLength = menuKeys.length;
  generateMenu();
  renderMenu();
  renderIntroMenu();
});
