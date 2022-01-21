let binaryLoaderStatus = false;
const getBinaryLoaderStatus = () => {
  binaryLoaderStatus = false;
  return fetch("http://127.0.0.1:9090/status", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status == "ready") {
        binaryLoaderStatus = true;
        return;
      }
      notify("Cannot Load Payload Because binloader Server Is Busy", 1);
    });
};

const injectBinaryPayloadPOST = (PLfile, responseTranformer) => {
  fetch("http://127.0.0.1:9090/status")
    .then((response) => response.json())
    .then((response) => {
      if (response.status == "ready") {
        fetch(PLfile)
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            return responseTranformer ? responseTranformer(buffer) : buffer;
          })
          .then((buffer) => {
            fetch("http://127.0.0.1:9090", {
              method: "POST",
              body: buffer,
            })
              .then(() => {
                notify("Payload Transfer Complete", 0);
              })
              .catch(() => {
                notify("Can't send the payload", 1);
              });
            return buffer;
          })
          .catch(() => {
            notify("Unable to load payload", 1);
          });
        return;
      }
      notify("Cannot Load Payload Because binloader Server Is Busy", 1);
    })
    .catch((error) => {
      $(".iframe").contentWindow.action__postBinaryPayload(
        PLfile,
        responseTranformer
      );
    });
};

const action__setTheme = (themeColors) => {
  const root = document.documentElement;

  root.style.setProperty("--color-black", themeColors[0]);
  root.style.setProperty("--color-cod-gray", themeColors[1]);
  root.style.setProperty("--color-primary-rgba", themeColors[2]);
  root.style.setProperty("--color-primary", themeColors[3]);
  root.style.setProperty("--color-secondary-rgba", themeColors[4]);
  root.style.setProperty("--color-secondary", themeColors[5]);
  root.style.setProperty("--color-white", themeColors[6]);
  root.style.setProperty("--color-error", themeColors[7]);
};

const action__setFan = ({ data }) => {
  const transformer = (arrayBuffer) => {
    const arr = new Uint8Array(arrayBuffer);
    arr[0x1d28] = data;
    return arr.buffer;
  };
  if (navigator.onLine) {
    injectBinaryPayloadPOST(`src/pl/fan.bin`, transformer);
    return;
  }

  $(".iframe").contentWindow.action__postBinaryPayload(
    `src/pl/fan.bin`,
    transformer
  );
};

const action__loadLinux = ({ data }) => {
  const transformer = (arrayBuffer) => {
    const arr = new Uint8Array(arrayBuffer);
    arr[0x409e] = data;
    arr[0x40b6] = data;
    return arr.buffer;
  };

  if (navigator.onLine) {
    injectBinaryPayloadPOST(`src/pl/linux-loader.bin`, transformer);
    return;
  }
  $(".iframe").contentWindow.action__postBinaryPayload(
    `src/pl/linux-loader.bin`,
    transformer
  );
};

const action__postBinaryPayload = (payloadUrl) => {
  if (navigator.onLine) {
    injectBinaryPayloadPOST(`src/pl/${payloadUrl}`);
    return;
  }
  $(".iframe").contentWindow.action__postBinaryPayload(`src/pl/${payloadUrl}`);
};

const action__loadUrl = (url) => {
  window.location.href = url;
};

const actions = {
  action__setFan,
  action__loadLinux,
  action__loadUrl,
  action__postBinaryPayload,
  action__setTheme,
};
