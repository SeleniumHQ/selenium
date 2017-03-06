browser.webNavigation.onCompleted.addListener(function(details) {
    browser.pageAction.show(details.tabId);
});

browser.pageAction.onClicked.addListener(function (details) {
    browser.tabs.query({ active: true }, function (tabs) {
        var active_tab = tabs[0];
        browser.pageAction.setIcon({ tabId: active_tab.id, path: { '19': 'icon-19-inv.png', '38': 'icon-38-inv.png' } });
    });
});