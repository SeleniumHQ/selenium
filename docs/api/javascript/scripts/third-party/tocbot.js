/* eslint no-var: off */
var defaultOptions = {
    ignoreSelector: '.js-toc-ignore',
    linkClass: 'toc-link',
    extraLinkClasses: '',
    activeLinkClass: 'is-active-link',
    listClass: 'toc-list',
    extraListClasses: '',
    isCollapsedClass: 'is-collapsed',
    collapsibleClass: 'is-collapsible',
    listItemClass: 'toc-list-item',
    activeListItemClass: 'is-active-li',
    collapseDepth: 0,
    scrollSmooth: true,
    scrollSmoothDuration: 420,
    scrollSmoothOffset: 0,
    scrollEndCallback: function (e) { },
    throttleTimeout: 50,
    positionFixedSelector: null,
    positionFixedClass: 'is-position-fixed',
    fixedSidebarOffset: 'auto',
    includeHtml: false,
    includeTitleTags: false,
    orderedList: true,
    scrollContainer: null,
    skipRendering: false,
    headingLabelCallback: false,
    ignoreHiddenElements: false,
    headingObjectCallback: null,
    basePath: '',
    disableTocScrollSync: false
}

function ParseContent(options) {
    var reduce = [].reduce

    /**
     * Get the last item in an array and return a reference to it.
     * @param {Array} array
     * @return {Object}
     */
    function getLastItem(array) {
        return array[array.length - 1]
    }

    /**
     * Get heading level for a heading dom node.
     * @param {HTMLElement} heading
     * @return {Number}
     */
    function getHeadingLevel(heading) {
        return +heading.nodeName.toUpperCase().replace('H', '')
    }

    /**
     * Get important properties from a heading element and store in a plain object.
     * @param {HTMLElement} heading
     * @return {Object}
     */
    function getHeadingObject(heading) {
        // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
        // first time heading is real DOM node element, second time it is obj
        // that is causing problem so I am processing only original DOM node
        if (!(heading instanceof window.HTMLElement)) return heading

        if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
            return null
        }

        const headingLabel = heading.getAttribute('data-heading-label') ||
            (options.headingLabelCallback ? String(options.headingLabelCallback(heading.textContent)) : heading.textContent.trim())
        var obj = {
            id: heading.id,
            children: [],
            nodeName: heading.nodeName,
            headingLevel: getHeadingLevel(heading),
            textContent: headingLabel
        }

        if (options.includeHtml) {
            obj.childNodes = heading.childNodes
        }

        if (options.headingObjectCallback) {
            return options.headingObjectCallback(obj, heading)
        }

        return obj
    }

    /**
     * Add a node to the nested array.
     * @param {Object} node
     * @param {Array} nest
     * @return {Array}
     */
    function addNode(node, nest) {
        var obj = getHeadingObject(node)
        var level = obj.headingLevel
        var array = nest
        var lastItem = getLastItem(array)
        var lastItemLevel = lastItem
            ? lastItem.headingLevel
            : 0
        var counter = level - lastItemLevel

        while (counter > 0) {
            lastItem = getLastItem(array)
            // Handle case where there are multiple h5+ in a row.
            if (lastItem && level === lastItem.headingLevel) {
                break
            } else if (lastItem && lastItem.children !== undefined) {
                array = lastItem.children
            }
            counter--
        }

        if (level >= options.collapseDepth) {
            obj.isCollapsed = true
        }

        array.push(obj)
        return array
    }

    /**
     * Select headings in content area, exclude any selector in options.ignoreSelector
     * @param {HTMLElement} contentElement
     * @param {Array} headingSelector
     * @return {Array}
     */
    function selectHeadings(contentElement, headingSelector) {
        var selectors = headingSelector
        if (options.ignoreSelector) {
            selectors = headingSelector.split(',')
                .map(function mapSelectors(selector) {
                    return selector.trim() + ':not(' + options.ignoreSelector + ')'
                })
        }
        try {
            return contentElement.querySelectorAll(selectors)
        } catch (e) {
            console.warn('Headers not found with selector: ' + selectors); // eslint-disable-line
            return null
        }
    }

    /**
     * Nest headings array into nested arrays with 'children' property.
     * @param {Array} headingsArray
     * @return {Object}
     */
    function nestHeadingsArray(headingsArray) {
        return reduce.call(headingsArray, function reducer(prev, curr) {
            var currentHeading = getHeadingObject(curr)
            if (currentHeading) {
                addNode(currentHeading, prev.nest)
            }
            return prev
        }, {
            nest: []
        })
    }

    return {
        nestHeadingsArray: nestHeadingsArray,
        selectHeadings: selectHeadings
    }
}

function BuildHtml(options) {
    var forEach = [].forEach
    var some = [].some
    var body = document.body
    var tocElement
    var mainContainer = document.querySelector(options.contentSelector)
    var currentlyHighlighting = true
    var SPACE_CHAR = ' '

    /**
     * Create link and list elements.
     * @param {Object} d
     * @param {HTMLElement} container
     * @return {HTMLElement}
     */
    function createEl(d, container) {
        var link = container.appendChild(createLink(d))
        if (d.children.length) {
            var list = createList(d.isCollapsed)
            d.children.forEach(function (child) {
                createEl(child, list)
            })
            link.appendChild(list)
        }
    }

    /**
     * Render nested heading array data into a given element.
     * @param {HTMLElement} parent Optional. If provided updates the {@see tocElement} to match.
     * @param {Array} data
     * @return {HTMLElement}
     */
    function render(parent, data) {
        var collapsed = false
        var container = createList(collapsed)

        data.forEach(function (d) {
            createEl(d, container)
        })

        // Return if no TOC element is provided or known.
        tocElement = parent || tocElement
        if (tocElement === null) {
            return
        }

        // Remove existing child if it exists.
        if (tocElement.firstChild) {
            tocElement.removeChild(tocElement.firstChild)
        }

        // Just return the parent and don't append the list if no links are found.
        if (data.length === 0) {
            return tocElement
        }

        // Append the Elements that have been created
        return tocElement.appendChild(container)
    }

    /**
     * Create link element.
     * @param {Object} data
     * @return {HTMLElement}
     */
    function createLink(data) {
        var item = document.createElement('li')
        var a = document.createElement('a')
        if (options.listItemClass) {
            item.setAttribute('class', options.listItemClass)
        }

        if (options.onClick) {
            a.onclick = options.onClick
        }

        if (options.includeTitleTags) {
            a.setAttribute('title', data.textContent)
        }

        if (options.includeHtml && data.childNodes.length) {
            forEach.call(data.childNodes, function (node) {
                a.appendChild(node.cloneNode(true))
            })
        } else {
            // Default behavior.
            a.textContent = data.textContent
        }
        a.setAttribute('href', options.basePath + '#' + data.id)
        a.setAttribute('class', options.linkClass +
            SPACE_CHAR + 'node-name--' + data.nodeName +
            SPACE_CHAR + options.extraLinkClasses)
        item.appendChild(a)
        return item
    }

    /**
     * Create list element.
     * @param {Boolean} isCollapsed
     * @return {HTMLElement}
     */
    function createList(isCollapsed) {
        var listElement = (options.orderedList) ? 'ol' : 'ul'
        var list = document.createElement(listElement)
        var classes = options.listClass +
            SPACE_CHAR + options.extraListClasses
        if (isCollapsed) {
            classes += SPACE_CHAR + options.collapsibleClass
            classes += SPACE_CHAR + options.isCollapsedClass
        }
        list.setAttribute('class', classes)
        return list
    }

    /**
     * Update fixed sidebar class.
     * @return {HTMLElement}
     */
    function updateFixedSidebarClass() {
        if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
            var top
            top = document.querySelector(options.scrollContainer).scrollTop
        } else {
            top = document.documentElement.scrollTop || body.scrollTop
        }
        var posFixedEl = document.querySelector(options.positionFixedSelector)

        if (options.fixedSidebarOffset === 'auto') {
            options.fixedSidebarOffset = tocElement.offsetTop
        }

        if (top > options.fixedSidebarOffset) {
            if (posFixedEl.className.indexOf(options.positionFixedClass) === -1) {
                posFixedEl.className += SPACE_CHAR + options.positionFixedClass
            }
        } else {
            posFixedEl.className = posFixedEl.className.split(SPACE_CHAR + options.positionFixedClass).join('')
        }
    }

    /**
     * Get top position of heading
     * @param {HTMLElement} obj
     * @return {int} position
     */
    function getHeadingTopPos(obj) {
        var position = 0
        if (obj !== null) {
            position = obj.offsetTop
            if (options.hasInnerContainers) { position += getHeadingTopPos(obj.offsetParent) }
        }
        return position
    }


    function updateListActiveElement(topHeader) {
        var forEach = [].forEach

        var tocLinks = tocElement
            .querySelectorAll('.' + options.linkClass)
        forEach.call(tocLinks, function (tocLink) {
            tocLink.className = tocLink.className.split(SPACE_CHAR + options.activeLinkClass).join('')
        })
        var tocLis = tocElement
            .querySelectorAll('.' + options.listItemClass)
        forEach.call(tocLis, function (tocLi) {
            tocLi.className = tocLi.className.split(SPACE_CHAR + options.activeListItemClass).join('')
        })

        // Add the active class to the active tocLink.
        var activeTocLink = tocElement
            .querySelector('.' + options.linkClass +
                '.node-name--' + topHeader.nodeName +
                '[href="' + options.basePath + '#' + topHeader.id.replace(/([ #;&,.+*~':"!^$[\]()=>|/@])/g, '\\$1') + '"]')
        if (activeTocLink && activeTocLink.className.indexOf(options.activeLinkClass) === -1) {
            activeTocLink.className += SPACE_CHAR + options.activeLinkClass
        }
        var li = activeTocLink && activeTocLink.parentNode
        if (li && li.className.indexOf(options.activeListItemClass) === -1) {
            li.className += SPACE_CHAR + options.activeListItemClass
        }

        var tocLists = tocElement
            .querySelectorAll('.' + options.listClass + '.' + options.collapsibleClass)

        // Collapse the other collapsible lists.
        forEach.call(tocLists, function (list) {
            if (list.className.indexOf(options.isCollapsedClass) === -1) {
                list.className += SPACE_CHAR + options.isCollapsedClass
            }
        })

        // Expand the active link's collapsible list and its sibling if applicable.
        if (activeTocLink && activeTocLink.nextSibling && activeTocLink.nextSibling.className.indexOf(options.isCollapsedClass) !== -1) {
            activeTocLink.nextSibling.className = activeTocLink.nextSibling.className.split(SPACE_CHAR + options.isCollapsedClass).join('')
        }
        removeCollapsedFromParents(activeTocLink && activeTocLink.parentNode.parentNode)
    }

    /**
     * Update TOC highlighting and collpased groupings.
     */
    function updateToc(headingsArray) {
        // If a fixed content container was set
        if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
            var top
            top = document.querySelector(options.scrollContainer).scrollTop
        } else {
            top = document.documentElement.scrollTop || body.scrollTop
        }

        // Add fixed class at offset
        if (options.positionFixedSelector) {
            updateFixedSidebarClass()
        }

        // Get the top most heading currently visible on the page so we know what to highlight.
        var headings = headingsArray
        var topHeader
        // Using some instead of each so that we can escape early.
        if (currentlyHighlighting &&
            tocElement !== null &&
            headings.length > 0) {
            some.call(headings, function (heading, i) {
                var modifiedTopOffset = top + 10
                if (mainContainer) {
                    modifiedTopOffset += mainContainer.clientHeight * (mainContainer.scrollTop) / (mainContainer.scrollHeight - mainContainer.clientHeight)
                }
                if (getHeadingTopPos(heading) > modifiedTopOffset) {
                    // Don't allow negative index value.
                    var index = (i === 0) ? i : i - 1
                    topHeader = headings[index]
                    return true
                } else if (i === headings.length - 1) {
                    // This allows scrolling for the last heading on the page.
                    topHeader = headings[headings.length - 1]
                    return true
                }
            })

            // Remove the active class from the other tocLinks.
            updateListActiveElement(topHeader)
        }
    }

    /**
     * Remove collpased class from parent elements.
     * @param {HTMLElement} element
     * @return {HTMLElement}
     */
    function removeCollapsedFromParents(element) {
        if (element && element.className.indexOf(options.collapsibleClass) !== -1 && element.className.indexOf(options.isCollapsedClass) !== -1) {
            element.className = element.className.split(SPACE_CHAR + options.isCollapsedClass).join('')
            return removeCollapsedFromParents(element.parentNode.parentNode)
        }
        return element
    }

    /**
     * Disable TOC Animation when a link is clicked.
     * @param {Event} event
     */
    function disableTocAnimation(event) {
        var target = event.target || event.srcElement
        if (typeof target.className !== 'string' || target.className.indexOf(options.linkClass) === -1) {
            return
        }
        // Bind to tocLink clicks to temporarily disable highlighting
        // while smoothScroll is animating.
        currentlyHighlighting = false
    }

    /**
     * Enable TOC Animation.
     */
    function enableTocAnimation() {
        currentlyHighlighting = true
    }

    return {
        enableTocAnimation: enableTocAnimation,
        disableTocAnimation: disableTocAnimation,
        render: render,
        updateToc: updateToc,
        updateListActiveElement: updateListActiveElement
    }
}

function updateTocScroll(options) {
    var toc = options.tocElement || document.querySelector(options.tocSelector)
    if (toc && toc.scrollHeight > toc.clientHeight) {
        var activeItem = toc.querySelector('.' + options.activeListItemClass)
        if (activeItem) {
            var topOffset = toc.getBoundingClientRect().top
            toc.scrollTop = activeItem.offsetTop - topOffset
        }
    }
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory(root))
    } else if (typeof exports === 'object') {
        module.exports = factory(root)
    } else {
        root.tocbot = factory(root)
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {
    'use strict'

    var options = {}
    var tocbot = {}
    var buildHtml
    var parseContent

    // Just return if its not a browser.
    var supports = !!root && !!root.document && !!root.document.querySelector && !!root.addEventListener // Feature test
    if (typeof window === 'undefined' && !supports) {
        return
    }
    var headingsArray

    // From: https://github.com/Raynos/xtend
    var hasOwnProperty = Object.prototype.hasOwnProperty
    function extend() {
        var target = {}
        for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i]
            for (var key in source) {
                if (hasOwnProperty.call(source, key)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    }

    // From: https://remysharp.com/2010/07/21/throttling-function-calls
    function throttle(fn, threshhold, scope) {
        threshhold || (threshhold = 250)
        var last
        var deferTimer
        return function () {
            var context = scope || this
            var now = +new Date()
            var args = arguments
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer)
                deferTimer = setTimeout(function () {
                    last = now
                    fn.apply(context, args)
                }, threshhold)
            } else {
                last = now
                fn.apply(context, args)
            }
        }
    }

    function getContentElement(options) {
        try {
            return options.contentElement || document.querySelector(options.contentSelector)
        } catch (e) {
            console.warn('Contents element not found: ' + options.contentSelector) // eslint-disable-line
            return null
        }
    }

    function getTocElement(options) {
        try {
            return options.tocElement || document.querySelector(options.tocSelector)
        } catch (e) {
            console.warn('TOC element not found: ' + options.tocSelector) // eslint-disable-line
            return null
        }
    }

    /**
     * Destroy tocbot.
     */
    tocbot.destroy = function () {
        var tocElement = getTocElement(options)
        if (tocElement === null) {
            return
        }

        if (!options.skipRendering) {
            // Clear HTML.
            if (tocElement) {
                tocElement.innerHTML = ''
            }
        }

        // Remove event listeners.
        if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
            document.querySelector(options.scrollContainer).removeEventListener('scroll', this._scrollListener, false)
            document.querySelector(options.scrollContainer).removeEventListener('resize', this._scrollListener, false)
        } else {
            document.removeEventListener('scroll', this._scrollListener, false)
            document.removeEventListener('resize', this._scrollListener, false)
        }
    }

    /**
     * Initialize tocbot.
     * @param {object} customOptions
     */
    tocbot.init = function (customOptions) {
        // feature test
        if (!supports) {
            return
        }

        // Merge defaults with user options.
        // Set to options variable at the top.
        options = extend(defaultOptions, customOptions || {})
        this.options = options
        this.state = {}

        // Init smooth scroll if enabled (default).
        if (options.scrollSmooth) {
            options.duration = options.scrollSmoothDuration
            options.offset = options.scrollSmoothOffset
        }

        // Pass options to these modules.
        buildHtml = BuildHtml(options)
        parseContent = ParseContent(options)

        // For testing purposes.
        this._buildHtml = buildHtml
        this._parseContent = parseContent
        this._headingsArray = headingsArray
        this.updateTocListActiveElement = buildHtml.updateListActiveElement

        // Destroy it if it exists first.
        tocbot.destroy()

        var contentElement = getContentElement(options)
        if (contentElement === null) {
            return
        }

        var tocElement = getTocElement(options)
        if (tocElement === null) {
            return
        }

        // Get headings array.
        headingsArray = parseContent.selectHeadings(contentElement, options.headingSelector)
        // Return if no headings are found.
        if (headingsArray === null) {
            return
        }

        // Build nested headings array.
        var nestedHeadingsObj = parseContent.nestHeadingsArray(headingsArray)
        var nestedHeadings = nestedHeadingsObj.nest

        // Render.
        if (!options.skipRendering) {
            buildHtml.render(tocElement, nestedHeadings)
        }

        // Update Sidebar and bind listeners.
        this._scrollListener = throttle(function (e) {
            buildHtml.updateToc(headingsArray)
            !options.disableTocScrollSync && updateTocScroll(options)
            var isTop = e && e.target && e.target.scrollingElement && e.target.scrollingElement.scrollTop === 0
            if ((e && (e.eventPhase === 0 || e.currentTarget === null)) || isTop) {
                buildHtml.updateToc(headingsArray)
                if (options.scrollEndCallback) {
                    options.scrollEndCallback(e)
                }
            }
        }, options.throttleTimeout)
        this._scrollListener()
        if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
            document.querySelector(options.scrollContainer).addEventListener('scroll', this._scrollListener, false)
            document.querySelector(options.scrollContainer).addEventListener('resize', this._scrollListener, false)
        } else {
            document.addEventListener('scroll', this._scrollListener, false)
            document.addEventListener('resize', this._scrollListener, false)
        }

        return this
    }

    /**
     * Refresh tocbot.
     */
    tocbot.refresh = function (customOptions) {
        tocbot.destroy()
        tocbot.init(customOptions || this.options)
    }

    // Make tocbot available globally.
    root.tocbot = tocbot

    return tocbot
})