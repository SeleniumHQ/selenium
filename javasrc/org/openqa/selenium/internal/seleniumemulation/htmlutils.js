var htmlutils = {
  highlight : function(element) {
    var highLightColor = "yellow";
    if (element.originalColor == undefined) { // avoid picking up highlight
        element.originalColor = this.elementGetStyle(element, "background-color");
    }
    this.elementSetStyle(element, {"backgroundColor" : highLightColor});
    window.setTimeout(function() {
        try {
            //if element is orphan, probably page of it has already gone, so ignore
            if (!element.parentNode) {
                return;
            }
            this.elementSetStyle(element, {"backgroundColor" : element.originalColor});
        } catch (e) {} // DGF unhighlighting is very dangerous and low priority
    }, 200);
},

elementSetStyle : function(element, style) {
    for (var name in style) {
      var value = style[name];
      if (value == null) value = "";
      element.style[name] = value;
    }
},

elementGetStyle : function(element, style) {
    var value = element.style[style];
    if (!value) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(style) : null;
      } else if (element.currentStyle) {
        value = element.currentStyle[style];
      }
    }

    /** DGF necessary?
    if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
      if (Element.getStyle(element, 'position') == 'static') value = 'auto'; */

    return value == 'auto' ? null : value;
  },

absolutify: function(url, baseUrl) {
    /** returns a relative url in its absolute form, given by baseUrl.
    *
    * This function is a little odd, because it can take baseUrls that
    * aren't necessarily directories.  It uses the same rules as the HTML
    * &lt;base&gt; tag; if the baseUrl doesn't end with "/", we'll assume
    * that it points to a file, and strip the filename off to find its
    * base directory.
    *
    * So absolutify("foo", "http://x/bar") will return "http://x/foo" (stripping off bar),
    * whereas absolutify("foo", "http://x/bar/") will return "http://x/bar/foo" (preserving bar).
    * Naturally absolutify("foo", "http://x") will return "http://x/foo", appropriately.
    *
    * @param url the url to make absolute; if this url is already absolute, we'll just return that, unchanged
    * @param baseUrl the baseUrl from which we'll absolutify, following the rules above.
    * @return 'url' if it was already absolute, or the absolutized version of url if it was not absolute.
    */

    // DGF isn't there some library we could use for this?

    if (/^\w+:/.test(url)) {
        // it's already absolute
        return url;
    }

    var loc;
    try {
        loc = this.parseUrl(baseUrl);
    } catch (e) {
        // is it an absolute windows file path? let's play the hero in that case
        if (/^\w:\\/.test(baseUrl)) {
            baseUrl = "file:///" + baseUrl.replace(/\\/g, "/");
            loc = this.parseUrl(baseUrl);
        } else {
            throw new SeleniumError("baseUrl wasn't absolute: " + baseUrl);
        }
    }
    loc.search = null;
    loc.hash = null;

    // if url begins with /, then that's the whole pathname
    if (/^\//.test(url)) {
        loc.pathname = url;
        var result = this.reassembleLocation(loc);
        return result;
    }

    // if pathname is null, then we'll just append "/" + the url
    if (!loc.pathname) {
        loc.pathname = "/" + url;
        var result = this.reassembleLocation(loc);
        return result;
    }

    // if pathname ends with /, just append url
    if (/\/$/.test(loc.pathname)) {
        loc.pathname += url;
        var result = this.reassembleLocation(loc);
        return result;
    }

    // if we're here, then the baseUrl has a pathname, but it doesn't end with /
    // in that case, we replace everything after the final / with the relative url
    loc.pathname = loc.pathname.replace(/[^\/\\]+$/, url);
    var result = this.reassembleLocation(loc);
    return result;

},

URL_REGEX : /^((\w+):\/\/)(([^:]+):?([^@]+)?@)?([^\/\?:]*):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(.+)?/,

parseUrl : function(url) {
    var fields = ['url', null, 'protocol', null, 'username', 'password', 'host', 'port', 'pathname', 'search', 'hash'];
    var result = this.URL_REGEX.exec(url);
    if (!result) {
        throw new SeleniumError("Invalid URL: " + url);
    }
    var loc = new Object();
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field == null) {
            continue;
        }
        loc[field] = result[i];
    }
    return loc;
},

reassembleLocation : function(loc) {
    if (!loc.protocol) {
        throw new Error("Not a valid location object: " + o2s(loc));
    }
    var protocol = loc.protocol;
    protocol = protocol.replace(/:$/, "");
    var url = protocol + "://";
    if (loc.username) {
        url += loc.username;
        if (loc.password) {
            url += ":" + loc.password;
        }
        url += "@";
    }
    if (loc.host) {
        url += loc.host;
    }

    if (loc.port) {
        url += ":" + loc.port;
    }

    if (loc.pathname) {
        url += loc.pathname;
    }

    if (loc.search) {
        url += "?" + loc.search;
    }
    if (loc.hash) {
        var hash = loc.hash;
        hash = loc.hash.replace(/^#/, "");
        url += "#" + hash;
    }
    return url;
},

getTextContent: function(element, preformatted) {
    if (element.style && (element.style.visibility == 'hidden' || element.style.display == 'none')) return '';
    if (element.nodeType == 3 /*Node.TEXT_NODE*/) {
        var text = element.data;
        if (!preformatted) {
            text = text.replace(/\n|\r|\t/g, " ");
        }
        return text.replace(/&nbsp/, " ");
    }
    if (element.nodeType == 1 /*Node.ELEMENT_NODE*/ && element.nodeName != 'SCRIPT') {
        var childrenPreformatted = preformatted || (element.tagName == "PRE");
        var text = "";
        for (var i = 0; i < element.childNodes.length; i++) {
            var child = element.childNodes.item(i);
            text += this.getTextContent(child, childrenPreformatted);
        }
        // Handle block elements that introduce newlines
        // -- From HTML spec:
        //<!ENTITY % block
        //     "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT |
        //      BLOCKQUOTE | F:wORM | HR | TABLE | FIELDSET | ADDRESS">
        //
        // TODO: should potentially introduce multiple newlines to separate blocks
        if (element.tagName == "P" || element.tagName == "BR" || element.tagName == "HR" || element.tagName == "DIV") {
            text += "\n";
        }
        return text.replace(/&nbsp/, " ");
    }
    return '';
}

};