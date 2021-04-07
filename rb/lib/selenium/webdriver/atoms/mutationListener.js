(function () {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case 'attributes':
          // Don't report our own attribute has changed.
          if (mutation.attributeName === "data-__webdriver_id") {
            break;
          }
          const curr = mutation.target.getAttribute(mutation.attributeName);
          var id = mutation.target.dataset.__webdriver_id
          if (!id) {
            id = Math.random().toString(36).substring(2) + Date.now().toString(36);
            mutation.target.dataset.__webdriver_id = id;
          }
          const json = JSON.stringify({
            'target': id,
            'name': mutation.attributeName,
            'value': curr,
            'oldValue': mutation.oldValue
          });
          __webdriver_attribute(json);
          break;
        default:
          break;
      }
    }
  });

  observer.observe(document, {
    'attributes': true,
    'attributeOldValue': true,
    'characterData': true,
    'characterDataOldValue': true,
    'childList': true,
    'subtree': true
  });
})();
