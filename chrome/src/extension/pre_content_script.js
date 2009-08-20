if (document.location != "about:blank") {
  //If loading windows using window.open, the port is opened
  //while we are on about:blank (which reports window.name as ''),
  //and we use port-per-tab semantics, so don't open the port if
  //we're on about:blank
  console.log("Pre-connecting port");
  chrome.extension.connect();
}