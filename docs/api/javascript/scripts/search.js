/* global document */

const searchId = 'LiBfqbJVcV';
const searchHash = '#' + searchId;
const searchContainer = document.querySelector('#PkfLWpAbet');
const searchWrapper = document.querySelector('#iCxFxjkHbP');
const searchCloseButton = document.querySelector('#VjLlGakifb');
const searchInput = document.querySelector('#vpcKVYIppa');
const resultBox = document.querySelector('#fWwVHRuDuN');

function showResultText(text) {
  resultBox.innerHTML = `<span class="search-result-c-text">${text}</span>`;
}

function hideSearch() {
  // eslint-disable-next-line no-undef
  if (window.location.hash === searchHash) {
    // eslint-disable-next-line no-undef
    history.go(-1);
  }

  // eslint-disable-next-line no-undef
  window.onhashchange = null;

  if (searchContainer) {
    searchContainer.style.display = 'none';
  }
}

function listenCloseKey(event) {
  if (event.key === 'Escape') {
    hideSearch();
    // eslint-disable-next-line no-undef
    window.removeEventListener('keyup', listenCloseKey);
  }
}

function showSearch() {
  try {
    // Closing mobile menu before opening
    // search box.
    // It is defined in core.js
    // eslint-disable-next-line no-undef
    hideMobileMenu();
  } catch (error) {
    console.error(error);
  }

  // eslint-disable-next-line no-undef
  window.onhashchange = hideSearch;

  // eslint-disable-next-line no-undef
  if (window.location.hash !== searchHash) {
    // eslint-disable-next-line no-undef
    history.pushState(null, null, searchHash);
  }

  if (searchContainer) {
    searchContainer.style.display = 'flex';
    // eslint-disable-next-line no-undef
    window.addEventListener('keyup', listenCloseKey);
  }

  if (searchInput) {
    searchInput.focus();
  }
}

async function fetchAllData() {
  // eslint-disable-next-line no-undef
  const { hostname, protocol, port } = location;

  // eslint-disable-next-line no-undef
  const base = protocol + '//' + hostname + (port !== '' ? ':' + port : '') + baseURL;
  // eslint-disable-next-line no-undef
  const url = new URL('data/search.json', base);
  const result = await fetch(url);
  const { list } = await result.json();

  return list;
}

// eslint-disable-next-line no-unused-vars
function onClickSearchItem(event) {
  const target = event.currentTarget;

  if (target) {
    const href = target.getAttribute('href') || '';
    let elementId = href.split('#')[1] || '';
    let element = document.getElementById(elementId);

    if (!element) {
      elementId = decodeURI(elementId);
      element = document.getElementById(elementId);
    }

    if (element) {
      setTimeout(function() {
        // eslint-disable-next-line no-undef
        bringElementIntoView(element); // defined in core.js
      }, 100);
    }
  }
}

function buildSearchResult(result) {
  let output = '';
  const removeHTMLTagsRegExp = /(<([^>]+)>)/ig;
  
  for (const res of result) {
    const { title = '', description = '' } = res.item;

    const _link = res.item.link.replace('<a href="', '').replace(/">.*/, '');
    const _title = title.replace(removeHTMLTagsRegExp, "");
    const _description = description.replace(removeHTMLTagsRegExp, "");

    output += `
    <a onclick="onClickSearchItem(event)" href="${_link}" class="search-result-item">
      <div class="search-result-item-title">${_title}</div>
      <div class="search-result-item-p">${_description || 'No description available.'}</div>
    </a>
    `;
  }

  return output;
}

function getSearchResult(list, keys, searchKey) {
  const defaultOptions = {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: keys
  };

  const options = { ...defaultOptions };

  // eslint-disable-next-line no-undef
  const searchIndex = Fuse.createIndex(options.keys, list);

  // eslint-disable-next-line no-undef
  const fuse = new Fuse(list, options, searchIndex);

  const result = fuse.search(searchKey);

  if (result.length > 20) {
    return result.slice(0, 20);
  }

  return result;
}

function debounce(func, wait, immediate) {
  let timeout;

  return function() {
    const args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        // eslint-disable-next-line consistent-this, no-invalid-this
        func.apply(this, args);
      }
    }, wait);

    if (immediate && !timeout) {
      // eslint-disable-next-line consistent-this, no-invalid-this
      func.apply(this, args);
    }
  };
}

let searchData;

async function search(event) {
  const value = event.target.value;
  const keys = ['title', 'description'];

  if (!resultBox) {
    console.error('Search result container not found');

    return;
  }

  if (!value) {
    showResultText('Type anything to view search result');

    return;
  }

  if (!searchData) {
    showResultText('Loading...');

    try {
      // eslint-disable-next-line require-atomic-updates
      searchData = await fetchAllData();
    } catch (e) {
      console.log(e);
      showResultText('Failed to load result.');

      return;
    }
  }

  const result = getSearchResult(searchData, keys, value);

  if (!result.length) {
    showResultText('No result found! Try some different combination.');

    return;
  }

  // eslint-disable-next-line require-atomic-updates
  resultBox.innerHTML = buildSearchResult(result);
}

function onDomContentLoaded() {
  const searchButton = document.querySelectorAll('.search-button');
  const debouncedSearch = debounce(search, 300);

  if (searchCloseButton) {
    searchCloseButton.addEventListener('click', hideSearch);
  }

  if (searchButton) {
    searchButton.forEach(function(item) {
      item.addEventListener('click', showSearch);
    });
  }

  if (searchContainer) {
    searchContainer.addEventListener('click', hideSearch);
  }

  if (searchWrapper) {
    searchWrapper.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', debouncedSearch);
  }

  // eslint-disable-next-line no-undef
  if (window.location.hash === searchHash) {
    showSearch();
  }
}

// eslint-disable-next-line no-undef
window.addEventListener('DOMContentLoaded', onDomContentLoaded);

// eslint-disable-next-line no-undef
window.addEventListener('hashchange', function() {
  // eslint-disable-next-line no-undef
  if (window.location.hash === searchHash) {
    showSearch();
  }
});
