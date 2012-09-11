// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Class for rendering the results of an auto complete and
 * allow the user to select an row.
 *
 */

goog.provide('goog.ui.ac.Renderer');
goog.provide('goog.ui.ac.Renderer.CustomRenderer');

goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOutAndHide');
goog.require('goog.iter');
goog.require('goog.positioning');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.IdGenerator');
goog.require('goog.ui.ac.AutoComplete.EventType');
goog.require('goog.userAgent');



/**
 * Class for rendering the results of an auto-complete in a drop down list.
 *
 * @constructor
 * @param {Element=} opt_parentNode optional reference to the parent element
 *     that will hold the autocomplete elements. goog.dom.getDocument().body
 *     will be used if this is null.
 * @param {?({renderRow}|{render})=} opt_customRenderer Custom full renderer to
 *     render each row. Should be something with a renderRow or render method.
 * @param {boolean=} opt_rightAlign Determines if the autocomplete will always
 *     be right aligned. False by default.
 * @param {boolean=} opt_useStandardHighlighting Determines if standard
 *     highlighting should be applied to each row of data. Standard highlighting
 *     bolds every matching substring for a given token in each row.
 * @extends {goog.events.EventTarget}
 */
goog.ui.ac.Renderer = function(opt_parentNode, opt_customRenderer,
    opt_rightAlign, opt_useStandardHighlighting) {
  goog.base(this);

  /**
   * Reference to the parent element that will hold the autocomplete elements
   * @type {Element}
   * @private
   */
  this.parent_ = opt_parentNode || goog.dom.getDocument().body;

  /**
   * Dom helper for the parent element's document.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = goog.dom.getDomHelper(this.parent_);

  /**
   * Whether to reposition the autocomplete UI below the target node
   * @type {boolean}
   * @private
   */
  this.reposition_ = !opt_parentNode;

  /**
   * Reference to the main element that controls the rendered autocomplete
   * @type {Element}
   * @private
   */
  this.element_ = null;

  /**
   * The current token that has been entered
   * @type {string}
   * @private
   */
  this.token_ = '';

  /**
   * Array used to store the current set of rows being displayed
   * @type {Array}
   * @private
   */
  this.rows_ = [];

  /**
   * Array of the node divs that hold each result that is being displayed.
   * @type {Array.<Element>}
   * @protected
   * @suppress {underscore}
   */
  this.rowDivs_ = [];

  /**
   * The index of the currently highlighted row
   * @type {number}
   * @protected
   * @suppress {underscore}
   */
  this.hilitedRow_ = -1;

  /**
   * The time that the rendering of the menu rows started
   * @type {number}
   * @protected
   * @suppress {underscore}
   */
  this.startRenderingRows_ = -1;

  /**
   * Store the current state for the renderer
   * @type {boolean}
   * @private
   */
  this.visible_ = false;

  /**
   * Classname for the main element
   * @type {string}
   */
  this.className = goog.getCssName('ac-renderer');

  /**
   * Classname for row divs
   * @type {string}
   */
  this.rowClassName = goog.getCssName('ac-row');

  // TODO(gboyer): Remove this as soon as we remove references and ensure that
  // no groups are pushing javascript using this.
  /**
   * The old class name for active row.  This name is deprecated because its
   * name is generic enough that a typical implementation would require a
   * descendant selector.
   * Active row will have rowClassName & activeClassName &
   * legacyActiveClassName.
   * @type {string}
   * @private
   */
  this.legacyActiveClassName_ = goog.getCssName('active');

  /**
   * Class name for active row div.
   * Active row will have rowClassName & activeClassName &
   * legacyActiveClassName.
   * @type {string}
   */
  this.activeClassName = goog.getCssName('ac-active');

  /**
   * Class name for the bold tag highlighting the matched part of the text.
   * @type {string}
   */
  this.highlightedClassName = goog.getCssName('ac-highlighted');

  /**
   * Custom full renderer
   * @type {?({renderRow}|{render})}
   * @private
   */
  this.customRenderer_ = opt_customRenderer || null;

  /**
   * Flag to indicate whether standard highlighting should be applied.
   * this is set to true if left unspecified to retain existing
   * behaviour for autocomplete clients
   * @type {boolean}
   * @private
   */
  this.useStandardHighlighting_ = opt_useStandardHighlighting != null ?
      opt_useStandardHighlighting : true;

  /**
   * Flag to set all tokens as highlighted in the autocomplete row.
   * @type {boolean}
   * @private
   */
  this.highlightAllTokens_ = false;

  /**
   * Determines if the autocomplete will always be right aligned
   * @type {boolean}
   * @private
   */
  this.rightAlign_ = !!opt_rightAlign;

  /**
   * Whether to align with top of target field
   * @type {boolean}
   * @private
   */
  this.topAlign_ = false;

  /**
   * Duration (in msec) of fade animation when menu is shown/hidden.
   * Setting to 0 (default) disables animation entirely.
   * @type {number}
   * @private
   */
  this.menuFadeDuration_ = 0;

  /**
   * Animation in progress, if any.
   * @type {goog.fx.Animation|undefined}
   */
  this.animation_;
};
goog.inherits(goog.ui.ac.Renderer, goog.events.EventTarget);


/**
 * The anchor element to position the rendered autocompleter against.
 * @type {Element}
 * @private
 */
goog.ui.ac.Renderer.prototype.anchorElement_;


/**
 * The element on which to base the width of the autocomplete.
 * @type {Node}
 * @private
 */
goog.ui.ac.Renderer.prototype.widthProvider_;


/**
 * The delay before mouseover events are registered, in milliseconds
 * @type {number}
 * @const
 */
goog.ui.ac.Renderer.DELAY_BEFORE_MOUSEOVER = 300;


/**
 * Gets the renderer's element.
 * @return {Element} The  main element that controls the rendered autocomplete.
 */
goog.ui.ac.Renderer.prototype.getElement = function() {
  return this.element_;
};


/**
 * Sets the width provider element. The provider is only used on redraw and as
 * such will not automatically update on resize.
 * @param {Node} widthProvider The element whose width should be mirrored.
 */
goog.ui.ac.Renderer.prototype.setWidthProvider = function(widthProvider) {
  this.widthProvider_ = widthProvider;
};


/**
 * Set whether to align autocomplete to top of target element
 * @param {boolean} align If true, align to top.
 */
goog.ui.ac.Renderer.prototype.setTopAlign = function(align) {
  this.topAlign_ = align;
};


/**
 * Set whether to align autocomplete to the right of the target element.
 * @param {boolean} align If true, align to right.
 */
goog.ui.ac.Renderer.prototype.setRightAlign = function(align) {
  this.rightAlign_ = align;
};


/**
 * Set whether or not standard highlighting should be used when rendering rows.
 * @param {boolean} useStandardHighlighting true if standard highlighting used.
 */
goog.ui.ac.Renderer.prototype.setUseStandardHighlighting =
    function(useStandardHighlighting) {
  this.useStandardHighlighting_ = useStandardHighlighting;
};


/**
 * Set whether or not to highlight all matching tokens rather than just the
 * first.
 * @param {boolean} highlightAllTokens Whether to highlight all matching tokens
 *     rather than just the first.
 */
goog.ui.ac.Renderer.prototype.setHighlightAllTokens =
    function(highlightAllTokens) {
  this.highlightAllTokens_ = highlightAllTokens;
};


/**
 * Sets the duration (in msec) of the fade animation when menu is shown/hidden.
 * Setting to 0 (default) disables animation entirely.
 * @param {number} duration Duration (in msec) of the fade animation (or 0 for
 *     no animation).
 */
goog.ui.ac.Renderer.prototype.setMenuFadeDuration = function(duration) {
  this.menuFadeDuration_ = duration;
};


/**
 * Sets the anchor element for the subsequent call to renderRows.
 * @param {Element} anchor The anchor element.
 */
goog.ui.ac.Renderer.prototype.setAnchorElement = function(anchor) {
  this.anchorElement_ = anchor;
};


/**
 * Render the autocomplete UI
 *
 * @param {Array} rows Matching UI rows.
 * @param {string} token Token we are currently matching against.
 * @param {Element=} opt_target Current HTML node, will position popup beneath
 *     this node.
 */
goog.ui.ac.Renderer.prototype.renderRows = function(rows, token, opt_target) {
  this.token_ = token;
  this.rows_ = rows;
  this.hilitedRow_ = -1;
  this.startRenderingRows_ = goog.now();
  this.target_ = opt_target;
  this.rowDivs_ = [];
  this.redraw();
};


/**
 * Hide the object.
 */
goog.ui.ac.Renderer.prototype.dismiss = function() {
  if (this.target_) {
    goog.dom.a11y.setActiveDescendant(this.target_, null);
  }
  if (this.visible_) {
    this.visible_ = false;

    // Clear ARIA popup role for the target input box.
    if (this.target_) {
      goog.dom.a11y.setState(this.target_, goog.dom.a11y.State.HASPOPUP, false);
    }

    if (this.menuFadeDuration_ > 0) {
      goog.dispose(this.animation_);
      this.animation_ = new goog.fx.dom.FadeOutAndHide(this.element_,
          this.menuFadeDuration_);
      this.animation_.play();
    } else {
      goog.style.showElement(this.element_, false);
    }
  }
};


/**
 * Show the object.
 */
goog.ui.ac.Renderer.prototype.show = function() {
  if (!this.visible_) {
    this.visible_ = true;

    // Set ARIA roles and states for the target input box.
    if (this.target_) {
      goog.dom.a11y.setRole(this.target_, goog.dom.a11y.Role.COMBOBOX);
      goog.dom.a11y.setState(
          this.target_, goog.dom.a11y.State.AUTOCOMPLETE, 'list');
      goog.dom.a11y.setState(this.target_, goog.dom.a11y.State.HASPOPUP, true);
    }

    if (this.menuFadeDuration_ > 0) {
      goog.dispose(this.animation_);
      this.animation_ = new goog.fx.dom.FadeInAndShow(this.element_,
          this.menuFadeDuration_);
      this.animation_.play();
    } else {
      goog.style.showElement(this.element_, true);
    }
  }
};


/**
 * @return {boolean} True if the object is visible.
 */
goog.ui.ac.Renderer.prototype.isVisible = function() {
  return this.visible_;
};


/**
 * Sets the 'active' class of the nth item.
 * @param {number} index Index of the item to highlight.
 */
goog.ui.ac.Renderer.prototype.hiliteRow = function(index) {
  var rowDiv = index >= 0 && index < this.rowDivs_.length ?
      this.rowDivs_[index] : undefined;

  var evtObj = {type: goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
    rowNode: rowDiv};
  if (this.dispatchEvent(evtObj)) {
    this.hiliteNone();
    this.hilitedRow_ = index;
    if (rowDiv) {
      goog.dom.classes.add(rowDiv, this.activeClassName,
          this.legacyActiveClassName_);
      if (this.target_) {
        goog.dom.a11y.setActiveDescendant(this.target_, rowDiv);
      }
      goog.style.scrollIntoContainerView(rowDiv, this.element_);
    }
  }
};


/**
 * Removes the 'active' class from the currently selected row.
 */
goog.ui.ac.Renderer.prototype.hiliteNone = function() {
  if (this.hilitedRow_ >= 0) {
    goog.dom.classes.remove(this.rowDivs_[this.hilitedRow_],
                            this.activeClassName, this.legacyActiveClassName_);
  }
};


/**
 * Sets the 'active' class of the item with a given id.
 * @param {number} id Id of the row to hilight. If id is -1 then no rows get
 *     hilited.
 */
goog.ui.ac.Renderer.prototype.hiliteId = function(id) {
  if (id == -1) {
    this.hiliteRow(-1);
  } else {
    for (var i = 0; i < this.rows_.length; i++) {
      if (this.rows_[i].id == id) {
        this.hiliteRow(i);
        return;
      }
    }
  }
};


/**
 * Sets CSS classes on autocomplete conatainer element.
 *
 * @param {Element} elt The container element.
 * @private
 */
goog.ui.ac.Renderer.prototype.setMenuClasses_ = function(elt) {
  goog.dom.classes.add(elt, this.className);
};


/**
 * If the main HTML element hasn't been made yet, creates it and appends it
 * to the parent.
 * @private
 */
goog.ui.ac.Renderer.prototype.maybeCreateElement_ = function() {
  if (!this.element_) {
    // Make element and add it to the parent
    var el = this.dom_.createDom('div', {style: 'display:none'});
    this.element_ = el;
    this.setMenuClasses_(el);
    goog.dom.a11y.setRole(el, goog.dom.a11y.Role.LISTBOX);

    el.id = goog.ui.IdGenerator.getInstance().getNextUniqueId();

    this.dom_.appendChild(this.parent_, el);

    // Add this object as an event handler
    goog.events.listen(el, goog.events.EventType.CLICK,
                       this.handleClick_, false, this);
    goog.events.listen(el, goog.events.EventType.MOUSEDOWN,
                       this.handleMouseDown_, false, this);
    goog.events.listen(el, goog.events.EventType.MOUSEOVER,
                       this.handleMouseOver_, false, this);
  }
};


/**
 * Redraw (or draw if this is the first call) the rendered auto-complete drop
 * down.
 */
goog.ui.ac.Renderer.prototype.redraw = function() {
  // Create the element if it doesn't yet exist
  this.maybeCreateElement_();

  // For top aligned with target (= bottom aligned element),
  // we need to hide and then add elements while hidden to prevent
  // visible repositioning
  if (this.topAlign_) {
    this.element_.style.visibility = 'hidden';
  }

  if (this.widthProvider_) {
    var width = this.widthProvider_.clientWidth + 'px';
    this.element_.style.minWidth = width;
  }

  // Remove the current child nodes
  this.rowDivs_.length = 0;
  this.dom_.removeChildren(this.element_);

  // Generate the new rows (use forEach so we can change rows_ from an
  // array to a different datastructure if required)
  if (this.customRenderer_ && this.customRenderer_.render) {
    this.customRenderer_.render(this, this.element_, this.rows_, this.token_);
  } else {
    var curRow = null;
    goog.iter.forEach(this.rows_, function(row) {
      row = this.renderRowHtml(row, this.token_);
      if (this.topAlign_) {
        // Aligned with top of target = best match at bottom
        this.element_.insertBefore(row, curRow);
      } else {
        this.dom_.appendChild(this.element_, row);
      }
      curRow = row;
    }, this);
  }

  // Don't show empty result sets
  if (this.rows_.length == 0) {
    this.dismiss();
    return;
  } else {
    this.show();
  }

  this.reposition();

  // Make the autocompleter unselectable, so that it
  // doesn't steal focus from the input field when clicked.
  goog.style.setUnselectable(this.element_, true);
};


/**
 * Repositions the auto complete popup relative to the location node, if it
 * exists and the auto position has been set.
 */
goog.ui.ac.Renderer.prototype.reposition = function() {
  if (this.target_ && this.reposition_) {
    var anchorElement = this.anchorElement_ || this.target_;
    var anchorCorner = this.rightAlign_ ?
        goog.positioning.Corner.BOTTOM_RIGHT :
        goog.positioning.Corner.BOTTOM_LEFT;
    if (this.topAlign_) {
      anchorCorner = goog.positioning.flipCornerVertical(anchorCorner);
    }

    goog.positioning.positionAtAnchor(
        anchorElement, anchorCorner,
        this.element_, goog.positioning.flipCornerVertical(anchorCorner),
        null, null, goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN);

    if (this.topAlign_) {
      // This flickers, but is better than the alternative of positioning
      // in the wrong place and then moving.
      this.element_.style.visibility = 'visible';
    }
  }
};


/**
 * Sets whether the renderer should try to determine where to position the
 * drop down.
 * @param {boolean} auto Whether to autoposition the drop down.
 */
goog.ui.ac.Renderer.prototype.setAutoPosition = function(auto) {
  this.reposition_ = auto;
};


/**
 * Disposes of the renderer and its associated HTML.
 * @override
 * @protected
 */
goog.ui.ac.Renderer.prototype.disposeInternal = function() {
  if (this.element_) {
    goog.events.unlisten(this.element_, goog.events.EventType.CLICK,
        this.handleClick_, false, this);
    goog.events.unlisten(this.element_, goog.events.EventType.MOUSEDOWN,
        this.handleMouseDown_, false, this);
    goog.events.unlisten(this.element_, goog.events.EventType.MOUSEOVER,
        this.handleMouseOver_, false, this);
    this.dom_.removeNode(this.element_);
    this.element_ = null;
    this.visible_ = false;
  }

  goog.dispose(this.animation_);
  this.parent_ = null;

  goog.base(this, 'disposeInternal');
};


/**
 * Generic function that takes a row and renders a DOM structure for that row.
 *
 * Normally this will only be matching a maximum of 20 or so items.  Even with
 * 40 rows, DOM this building is fine.
 *
 * @param {Object} row Object representing row.
 * @param {string} token Token to highlight.
 * @param {Node} node The node to render into.
 * @private
 */
goog.ui.ac.Renderer.prototype.renderRowContents_ =
    function(row, token, node) {
  node.innerHTML = goog.string.htmlEscape(row.data.toString());
};


/**
 * Goes through a node and all of its child nodes, replacing HTML text that
 * matches a token with <b>token</b>.
 *
 * @param {Node} node Node to match.
 * @param {string|Array.<string>} tokenOrArray Token to match or array of tokens
 *     to match.  By default, only the first match will be highlighted.  If
 *     highlightAllTokens is set, then all tokens appearing at the start of a
 *     word, in whatever order and however many times, will be highlighted.
 * @private
 */
goog.ui.ac.Renderer.prototype.hiliteMatchingText_ =
    function(node, tokenOrArray) {
  if (node.nodeType == goog.dom.NodeType.TEXT) {

    var rest = null;
    if (goog.isArray(tokenOrArray) &&
        tokenOrArray.length > 1 &&
        !this.highlightAllTokens_) {
      rest = goog.array.slice(tokenOrArray, 1);
    }

    var token = this.getTokenRegExp_(tokenOrArray);
    if (token.length == 0) return;

    var text = node.nodeValue;

    // Create a regular expression to match a token at the beginning of a line
    // or preceeded by non-alpha-numeric characters
    // NOTE(user): this used to have a (^|\\W+) clause where it now has \\b
    // but it caused various browsers to hang on really long strings. It is
    // also excessive, because .*?\W+ is the same as .*?\b since \b already
    // checks that the character before the token is a non-word character
    // (the only time the regexp is different is if token begins with a
    // non-word character), and ^ matches the start of the line or following
    // a line terminator character, which is also \W. The initial group cannot
    // just be .*? as it will miss line terminators (which is what the \W+
    // clause used to match). Instead we use [\s\S] to match every character,
    // including line terminators.
    var re = new RegExp('([\\s\\S]*?)\\b(' + token + ')', 'gi');
    var textNodes = [];
    var lastIndex = 0;

    // Find all matches
    // Note: text.split(re) has inconsistencies between IE and FF, so
    // manually recreated the logic
    var match = re.exec(text);
    var numMatches = 0;
    while (match) {
      numMatches++;
      textNodes.push(match[1]);
      textNodes.push(match[2]);
      lastIndex = re.lastIndex;
      match = re.exec(text);
    }
    textNodes.push(text.substring(lastIndex));

    // Replace the tokens with bolded text.  Each pair of textNodes
    // (starting at index idx) includes a node of text before the bolded
    // token, and a node (at idx + 1) consisting of what should be
    // enclosed in bold tags.
    if (textNodes.length > 1) {
      var maxNumToBold = !this.highlightAllTokens_ ? 1 : numMatches;
      for (var i = 0; i < maxNumToBold; i++) {
        var idx = 2 * i;

        node.nodeValue = textNodes[idx];
        var boldTag = this.dom_.createElement('b');
        boldTag.className = this.highlightedClassName;
        this.dom_.appendChild(boldTag,
            this.dom_.createTextNode(textNodes[idx + 1]));
        boldTag = node.parentNode.insertBefore(boldTag, node.nextSibling);
        node.parentNode.insertBefore(this.dom_.createTextNode(''),
            boldTag.nextSibling);
        node = boldTag.nextSibling;
      }

      // Append the remaining text nodes to the end.
      var remainingTextNodes = goog.array.slice(textNodes, maxNumToBold * 2);
      node.nodeValue = remainingTextNodes.join('');
    } else if (rest) {
      this.hiliteMatchingText_(node, rest);
    }
  } else {
    var child = node.firstChild;
    while (child) {
      var nextChild = child.nextSibling;
      this.hiliteMatchingText_(child, tokenOrArray);
      child = nextChild;
    }
  }
};


/**
 * Transforms a token into a string ready to be put into the regular expression
 * in hiliteMatchingText_.
 * @param {string|Array.<string>} tokenOrArray The token or array to get the
 *     regex string from.
 * @return {string} The regex-ready token.
 * @private
 */
goog.ui.ac.Renderer.prototype.getTokenRegExp_ = function(tokenOrArray) {
  var token = '';

  if (!tokenOrArray) {
    return token;
  }

  if (goog.isArray(tokenOrArray)) {
    // Remove invalid tokens from the array, which may leave us with nothing.
    tokenOrArray = goog.array.filter(tokenOrArray, function(str) {
      return !goog.string.isEmptySafe(str);
    });
  }

  // If highlighting all tokens, join them with '|' so the regular expression
  // will match on any of them.
  if (this.highlightAllTokens_) {
    if (goog.isArray(tokenOrArray)) {
      var tokenArray = goog.array.map(tokenOrArray, goog.string.regExpEscape);
      token = tokenArray.join('|');
    } else {
      // Remove excess whitespace from the string so bars will separate valid
      // tokens in the regular expression.
      token = goog.string.collapseWhitespace(tokenOrArray);

      token = goog.string.regExpEscape(token);
      token = token.replace(/ /g, '|');
    }
  } else {
    // Not highlighting all matching tokens.  If tokenOrArray is a string, use
    // that as the token.  If it is an array, use the first element in the
    // array.
    // TODO(user): why is this this way?. We should match against all
    // tokens in the array, but only accept the first match.
    if (goog.isArray(tokenOrArray)) {
      token = tokenOrArray.length > 0 ?
          goog.string.regExpEscape(tokenOrArray[0]) : '';
    } else {
      // For the single-match string token, we refuse to match anything if
      // the string begins with a non-word character, as matches by definition
      // can only occur at the start of a word. (This also handles the
      // goog.string.isEmptySafe(tokenOrArray) case.)
      if (!/^\W/.test(tokenOrArray)) {
        token = goog.string.regExpEscape(tokenOrArray);
      }
    }
  }

  return token;
};


/**
 * Render a row by creating a div and then calling row rendering callback or
 * default row handler
 *
 * @param {Object} row Object representing row.
 * @param {string} token Token to highlight.
 * @return {Element} An element with the rendered HTML.
 */
goog.ui.ac.Renderer.prototype.renderRowHtml = function(row, token) {
  // Create and return the node
  var node = this.dom_.createDom('div', {
    className: this.rowClassName,
    id: goog.ui.IdGenerator.getInstance().getNextUniqueId()
  });
  goog.dom.a11y.setRole(node, goog.dom.a11y.Role.OPTION);
  if (this.customRenderer_ && this.customRenderer_.renderRow) {
    this.customRenderer_.renderRow(row, token, node);
  } else {
    this.renderRowContents_(row, token, node);
  }

  if (token && this.useStandardHighlighting_) {
    this.hiliteMatchingText_(node, token);
  }

  goog.dom.classes.add(node, this.rowClassName);
  this.rowDivs_.push(node);
  return node;
};


/**
 * Given an event target looks up through the parents till it finds a div.  Once
 * found it will then look to see if that is one of the childnodes, if it is
 * then the index is returned, otherwise -1 is returned.
 * @param {Element} et HtmlElement.
 * @return {number} Index corresponding to event target.
 * @private
 */
goog.ui.ac.Renderer.prototype.getRowFromEventTarget_ = function(et) {
  while (et && et != this.element_ &&
      !goog.dom.classes.has(et, this.rowClassName)) {
    et = /** @type {Element} */ (et.parentNode);
  }
  return et ? goog.array.indexOf(this.rowDivs_, et) : -1;
};


/**
 * Handle the click events.  These are redirected to the AutoComplete object
 * which then makes a callback to select the correct row.
 * @param {goog.events.Event} e Browser event object.
 * @private
 */
goog.ui.ac.Renderer.prototype.handleClick_ = function(e) {
  var index = this.getRowFromEventTarget_(/** @type {Element} */ (e.target));
  if (index >= 0) {
    this.dispatchEvent({
      type: goog.ui.ac.AutoComplete.EventType.SELECT,
      row: this.rows_[index].id
    });
  }
  e.stopPropagation();
};


/**
 * Handle the mousedown event and prevent the AC from losing focus.
 * @param {goog.events.Event} e Browser event object.
 * @private
 */
goog.ui.ac.Renderer.prototype.handleMouseDown_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
};


/**
 * Handle the mousing events.  These are redirected to the AutoComplete object
 * which then makes a callback to set the correctly highlighted row.  This is
 * because the AutoComplete can move the focus as well, and there is no sense
 * duplicating the code
 * @param {goog.events.Event} e Browser event object.
 * @private
 */
goog.ui.ac.Renderer.prototype.handleMouseOver_ = function(e) {
  var index = this.getRowFromEventTarget_(/** @type {Element} */ (e.target));
  if (index >= 0) {
    if ((goog.now() - this.startRenderingRows_) <
        goog.ui.ac.Renderer.DELAY_BEFORE_MOUSEOVER) {
      return;
    }

    this.dispatchEvent({
      type: goog.ui.ac.AutoComplete.EventType.HILITE,
      row: this.rows_[index].id
    });
  }
};



/**
 * Class allowing different implementations to custom render the autocomplete.
 * Extending classes should override the render function.
 * @constructor
 */
goog.ui.ac.Renderer.CustomRenderer = function() {
};


/**
 * Renders the autocomplete box. May be set to null.
 * @type {function(goog.ui.ac.Renderer, Element, Array, string)|
 *        null|undefined}
 * param {goog.ui.ac.Renderer} renderer The autocomplete renderer.
 * param {Element} element The main element that controls the rendered
 *     autocomplete.
 * param {Array} rows The current set of rows being displayed.
 * param {string} token The current token that has been entered.
 */
goog.ui.ac.Renderer.CustomRenderer.prototype.render = function(
    renderer, element, rows, token) {
};


/**
 * Generic function that takes a row and renders a DOM structure for that row.
 * @param {Object} row Object representing row.
 * @param {string} token Token to highlight.
 * @param {Node} node The node to render into.
 */
goog.ui.ac.Renderer.CustomRenderer.prototype.renderRow =
    function(row, token, node) {
};
