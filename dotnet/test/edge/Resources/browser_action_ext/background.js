browser.browserAction.onClicked.addListener(function (details) {
    browser.browserAction.setBadgeText({ text: "Hi!" });
    browser.browserAction.setIcon({ path: { '19': 'icon-19-inv.png', '38': 'icon-38-inv.png' } })
});

browser.browserAction.setBadgeText({ text: "Hi" });