/* global document */
// This file is @deprecated

var NAVBAR_OPTIONS = {};

(function() {
  var NAVBAR_RESIZE_LOCAL_STORAGE_KEY = 'NAVBAR_RESIZE_LOCAL_STORAGE_KEY';

  var navbar = document.querySelector('#navbar');
  var footer = document.querySelector('#footer');
  var mainSection = document.querySelector('#main');
  var localStorageResizeObject = JSON.parse(
    // eslint-disable-next-line no-undef
    localStorage.getItem(NAVBAR_RESIZE_LOCAL_STORAGE_KEY)
  );

  /**
     * Check whether we have any resize value in local storage or not.
     * If we have resize value then resize the navbar.
     **/
  if (localStorageResizeObject) {
    navbar.style.width = localStorageResizeObject.width;
    mainSection.style.marginLeft = localStorageResizeObject.width;
    footer.style.marginLeft = localStorageResizeObject.width;
  }

  var navbarSlider = document.querySelector('#navbar-resize');

  function resizeNavbar(event) {
    var pageX = event.pageX,
      pageXPlusPx = event.pageX + 'px',
      min = Number.parseInt(NAVBAR_OPTIONS.min, 10) || 300,
      max = Number.parseInt(NAVBAR_OPTIONS.max, 10) || 600;

    /**
         * Just to add some checks. If min is smaller than 10 then
         * user may accidentally end up reducing the size of navbar
         * less than 10. In that case user will not able to resize navbar
         * because navbar slider will be hidden.
         */
    if (min < 10) {
      min = 10;
    }

    /**
         * Only resize if pageX in range between min and max
         * allowed value.
         */
    if (min < pageX && pageX < max) {
      navbar.style.width = pageXPlusPx;
      mainSection.style.marginLeft = pageXPlusPx;
      footer.style.marginLeft = pageXPlusPx;
    }
  }

  function setupEventListeners() {
    // eslint-disable-next-line no-undef
    window.addEventListener('mousemove', resizeNavbar);
    // eslint-disable-next-line no-undef
    window.addEventListener('touchmove', resizeNavbar);
  }

  function afterRemovingEventListeners() {
    // eslint-disable-next-line no-undef
    localStorage.setItem(
      NAVBAR_RESIZE_LOCAL_STORAGE_KEY,
      JSON.stringify({
        width: navbar.style.width
      })
    );
  }

  function removeEventListeners() {
    // eslint-disable-next-line no-undef
    window.removeEventListener('mousemove', resizeNavbar);
    // eslint-disable-next-line no-undef
    window.removeEventListener('touchend', resizeNavbar);
    afterRemovingEventListeners();
  }

  navbarSlider.addEventListener('mousedown', setupEventListeners);
  navbarSlider.addEventListener('touchstart', setupEventListeners);
  // eslint-disable-next-line no-undef
  window.addEventListener('mouseup', removeEventListeners);
})();

// eslint-disable-next-line no-unused-vars
function setupResizeOptions(options) {
  NAVBAR_OPTIONS = options;
}
