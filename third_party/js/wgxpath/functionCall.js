 /**
  * @license
  * The MIT License
  *
  * Copyright (c) 2007 Cybozu Labs, Inc.
  * Copyright (c) 2012 Google Inc.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to
  * deal in the Software without restriction, including without limitation the
  * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  * sell copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  * IN THE SOFTWARE.
  */

/**
 * @fileoverview A function call expression.
 * @author gdennis@google.com (Greg Dennis)
 */

goog.provide('wgxpath.FunctionCall');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.string');
goog.require('wgxpath.Expr');
goog.require('wgxpath.Node');
goog.require('wgxpath.NodeSet');
goog.require('wgxpath.userAgent');
goog.require('wgxpath.DataType');



/**
 * A function call expression.
 *
 * @constructor
 * @extends {wgxpath.Expr}
 * @param {!wgxpath.FunctionCall.Func} func Function.
 * @param {!Array.<!wgxpath.Expr>} args Arguments to the function.
 */
wgxpath.FunctionCall = function(func, args) {
  // Check the provided arguments match the function parameters.
  if (args.length < func.minArgs_) {
    throw new Error('Function ' + func.name_ + ' expects at least' +
        func.minArgs_ + ' arguments, ' + args.length + ' given');
  }
  if (!goog.isNull(func.maxArgs_) && args.length > func.maxArgs_) {
    throw new Error('Function ' + func.name_ + ' expects at most ' +
        func.maxArgs_ + ' arguments, ' + args.length + ' given');
  }
  if (func.nodesetsRequired_) {
    goog.array.forEach(args, function(arg, i) {
      if (arg.getDataType() != wgxpath.DataType.NODESET) {
        throw new Error('Argument ' + i + ' to function ' + func.name_ +
            ' is not of type Nodeset: ' + arg);
      }
    });
  }
  wgxpath.Expr.call(this, func.dataType_);

  /**
   * @type {!wgxpath.FunctionCall.Func}
   * @private
   */
  this.func_ = func;

  /**
   * @type {!Array.<!wgxpath.Expr>}
   * @private
   */
  this.args_ = args;

  this.setNeedContextPosition(func.needContextPosition_ ||
      goog.array.some(args, function(arg) {
        return arg.doesNeedContextPosition();
      }));
  this.setNeedContextNode(
      (func.needContextNodeWithoutArgs_ && !args.length) ||
      (func.needContextNodeWithArgs_ && !!args.length) ||
      goog.array.some(args, function(arg) {
        return arg.doesNeedContextNode();
      }));
};
goog.inherits(wgxpath.FunctionCall, wgxpath.Expr);


/**
 * @override
 */
wgxpath.FunctionCall.prototype.evaluate = function(ctx) {
  var result = this.func_.evaluate_.apply(null,
      goog.array.concat(ctx, this.args_));
  return /** @type {!(string|boolean|number|wgxpath.NodeSet)} */ (result);
};


/**
 * @override
 */
wgxpath.FunctionCall.prototype.toString = function() {
  var text = 'Function: ' + this.func_;
  if (this.args_.length) {
    var args = goog.array.reduce(this.args_, function(prev, curr) {
      return prev + wgxpath.Expr.indent(curr);
    }, 'Arguments:');
    text += wgxpath.Expr.indent(args);
  }
  return text;
};



/**
 * A function in a function call expression.
 *
 * @constructor
 * @param {string} name Name of the function.
 * @param {wgxpath.DataType} dataType Datatype of the function return value.
 * @param {boolean} needContextPosition Whether the function needs a context
 *     position.
 * @param {boolean} needContextNodeWithoutArgs Whether the function needs a
 *     context node when not given arguments.
 * @param {boolean} needContextNodeWithArgs Whether the function needs a context
 *     node when the function is given arguments.
 * @param {function(!wgxpath.Context, ...!wgxpath.Expr):*} evaluate
 *     Evaluates the function in a context with any number of expression
 *     arguments.
 * @param {number} minArgs Minimum number of arguments accepted by the function.
 * @param {?number=} opt_maxArgs Maximum number of arguments accepted by the
 *     function; null means there is no max; defaults to minArgs.
 * @param {boolean=} opt_nodesetsRequired Whether the args must be nodesets.
 * @private
 */
wgxpath.FunctionCall.Func_ = function(name, dataType, needContextPosition,
    needContextNodeWithoutArgs, needContextNodeWithArgs, evaluate, minArgs,
    opt_maxArgs, opt_nodesetsRequired) {

  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {wgxpath.DataType}
   * @private
   */
  this.dataType_ = dataType;

  /**
   * @type {boolean}
   * @private
   */
  this.needContextPosition_ = needContextPosition;

  /**
   * @type {boolean}
   * @private
   */
  this.needContextNodeWithoutArgs_ = needContextNodeWithoutArgs;

  /**
   * @type {boolean}
   * @private
   */
  this.needContextNodeWithArgs_ = needContextNodeWithArgs;

  /**
   * @type {function(!wgxpath.Context, ...!wgxpath.Expr):*}
   * @private
   */
  this.evaluate_ = evaluate;

  /**
   * @type {number}
   * @private
   */
  this.minArgs_ = minArgs;

  /**
   * @type {?number}
   * @private
   */
  this.maxArgs_ = goog.isDef(opt_maxArgs) ? opt_maxArgs : minArgs;

  /**
   * @type {boolean}
   * @private
   */
  this.nodesetsRequired_ = !!opt_nodesetsRequired;
};


/**
 * @override
 */
wgxpath.FunctionCall.Func_.prototype.toString = function() {
  return this.name_;
};


/**
 * A mapping from function names to Func objects.
 *
 * @private
 * @type {!Object.<string, !wgxpath.FunctionCall.Func>}
 */
wgxpath.FunctionCall.nameToFuncMap_ = {};


/**
 * Constructs a Func and maps its name to it.
 *
 * @param {string} name Name of the function.
 * @param {wgxpath.DataType} dataType Datatype of the function return value.
 * @param {boolean} needContextPosition Whether the function needs a context
 *     position.
 * @param {boolean} needContextNodeWithoutArgs Whether the function needs a
 *     context node when not given arguments.
 * @param {boolean} needContextNodeWithArgs Whether the function needs a context
 *     node when the function is given arguments.
 * @param {function(!wgxpath.Context, ...!wgxpath.Expr):*} evaluate
 *     Evaluates the function in a context with any number of expression
 *     arguments.
 * @param {number} minArgs Minimum number of arguments accepted by the function.
 * @param {?number=} opt_maxArgs Maximum number of arguments accepted by the
 *     function; null means there is no max; defaults to minArgs.
 * @param {boolean=} opt_nodesetsRequired Whether the args must be nodesets.
 * @return {!wgxpath.FunctionCall.Func} The function created.
 * @private
 */
wgxpath.FunctionCall.createFunc_ = function(name, dataType,
    needContextPosition, needContextNodeWithoutArgs, needContextNodeWithArgs,
    evaluate, minArgs, opt_maxArgs, opt_nodesetsRequired) {
  if (wgxpath.FunctionCall.nameToFuncMap_.hasOwnProperty(name)) {
    throw new Error('Function already created: ' + name + '.');
  }
  var func = new wgxpath.FunctionCall.Func_(name, dataType,
      needContextPosition, needContextNodeWithoutArgs, needContextNodeWithArgs,
      evaluate, minArgs, opt_maxArgs, opt_nodesetsRequired);
  func = /** @type {!wgxpath.FunctionCall.Func} */ (func);
  wgxpath.FunctionCall.nameToFuncMap_[name] = func;
  return func;
};


/**
 * Returns the function object for this name.
 *
 * @param {string} name The function's name.
 * @return {wgxpath.FunctionCall.Func} The function object.
 */
wgxpath.FunctionCall.getFunc = function(name) {
  return wgxpath.FunctionCall.nameToFuncMap_[name] || null;
};


/**
 * An XPath function enumeration.
 *
 * <p>A list of XPath 1.0 functions:
 * http://www.w3.org/TR/xpath/#corelib
 *
 * @enum {!Object}
 */
wgxpath.FunctionCall.Func = {
  BOOLEAN: wgxpath.FunctionCall.createFunc_('boolean',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx, expr) {
        return expr.asBool(ctx);
      }, 1),
  CEILING: wgxpath.FunctionCall.createFunc_('ceiling',
      wgxpath.DataType.NUMBER, false, false, false,
      function(ctx, expr) {
        return Math.ceil(expr.asNumber(ctx));
      }, 1),
  CONCAT: wgxpath.FunctionCall.createFunc_('concat',
      wgxpath.DataType.STRING, false, false, false,
      function(ctx, var_args) {
        var exprs = goog.array.slice(arguments, 1);
        return goog.array.reduce(exprs, function(prev, curr) {
          return prev + curr.asString(ctx);
        }, '');
      }, 2, null),
  CONTAINS: wgxpath.FunctionCall.createFunc_('contains',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx, expr1, expr2) {
        return goog.string.contains(expr1.asString(ctx), expr2.asString(ctx));
      }, 2),
  COUNT: wgxpath.FunctionCall.createFunc_('count',
      wgxpath.DataType.NUMBER, false, false, false,
      function(ctx, expr) {
        return expr.evaluate(ctx).getLength();
      }, 1, 1, true),
  FALSE: wgxpath.FunctionCall.createFunc_('false',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx) {
        return false;
      }, 0),
  FLOOR: wgxpath.FunctionCall.createFunc_('floor',
      wgxpath.DataType.NUMBER, false, false, false,
      function(ctx, expr) {
        return Math.floor(expr.asNumber(ctx));
      }, 1),
  ID: wgxpath.FunctionCall.createFunc_('id',
      wgxpath.DataType.NODESET, false, false, false,
      function(ctx, expr) {
        var ctxNode = ctx.getNode();
        var doc = ctxNode.nodeType == goog.dom.NodeType.DOCUMENT ? ctxNode :
            ctxNode.ownerDocument;
        var ids = expr.asString(ctx).split(/\s+/);
        var nsArray = [];
        goog.array.forEach(ids, function(id) {
          var elem = idSingle(id);
          if (elem && !goog.array.contains(nsArray, elem)) {
            nsArray.push(elem);
          }
        });
        nsArray.sort(goog.dom.compareNodeOrder);
        var ns = new wgxpath.NodeSet();
        goog.array.forEach(nsArray, function(n) {
          ns.add(n);
        });
        return ns;

        function idSingle(id) {
          if (wgxpath.userAgent.IE_DOC_PRE_9) {
            var allId = doc.all[id];
            if (allId) {
              if (allId.nodeType && id == allId.id) {
                return allId;
              } else if (allId.length) {
                return goog.array.find(allId, function(elem) {
                  return id == elem.id;
                });
              }
            }
            return null;
          } else {
            return doc.getElementById(id);
          }
        }
      }, 1),
  LANG: wgxpath.FunctionCall.createFunc_('lang',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx, expr) {
        // TODO: Fully implement this.
        return false;
      }, 1),
  LAST: wgxpath.FunctionCall.createFunc_('last',
      wgxpath.DataType.NUMBER, true, false, false,
      function(ctx) {
        if (arguments.length != 1) {
          throw Error('Function last expects ()');
        }
        return ctx.getLast();
      }, 0),
  LOCAL_NAME: wgxpath.FunctionCall.createFunc_('local-name',
      wgxpath.DataType.STRING, false, true, false,
      function(ctx, opt_expr) {
        var node = opt_expr ? opt_expr.evaluate(ctx).getFirst() : ctx.getNode();
        return node ? (node.localName || node.nodeName.toLowerCase()) : '';
      }, 0, 1, true),
  NAME: wgxpath.FunctionCall.createFunc_('name',
      wgxpath.DataType.STRING, false, true, false,
      function(ctx, opt_expr) {
        // TODO: Fully implement this.
        var node = opt_expr ? opt_expr.evaluate(ctx).getFirst() : ctx.getNode();
        return node ? node.nodeName.toLowerCase() : '';
      }, 0, 1, true),
  NAMESPACE_URI: wgxpath.FunctionCall.createFunc_('namespace-uri',
      wgxpath.DataType.STRING, true, false, false,
      function(ctx, opt_expr) {
        // TODO: Fully implement this.
        return '';
      }, 0, 1, true),
  NORMALIZE_SPACE: wgxpath.FunctionCall.createFunc_('normalize-space',
      wgxpath.DataType.STRING, false, true, false,
      function(ctx, opt_expr) {
        var str = opt_expr ? opt_expr.asString(ctx) :
            wgxpath.Node.getValueAsString(ctx.getNode());
        return goog.string.collapseWhitespace(str);
      }, 0, 1),
  NOT: wgxpath.FunctionCall.createFunc_('not',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx, expr) {
        return !expr.asBool(ctx);
      }, 1),
  NUMBER: wgxpath.FunctionCall.createFunc_('number',
      wgxpath.DataType.NUMBER, false, true, false,
      function(ctx, opt_expr) {
        return opt_expr ? opt_expr.asNumber(ctx) :
            wgxpath.Node.getValueAsNumber(ctx.getNode());
      }, 0, 1),
  POSITION: wgxpath.FunctionCall.createFunc_('position',
      wgxpath.DataType.NUMBER, true, false, false,
      function(ctx) {
        return ctx.getPosition();
      }, 0),
  ROUND: wgxpath.FunctionCall.createFunc_('round',
      wgxpath.DataType.NUMBER, false, false, false,
      function(ctx, expr) {
        return Math.round(expr.asNumber(ctx));
      }, 1),
  STARTS_WITH: wgxpath.FunctionCall.createFunc_('starts-with',
      wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx, expr1, expr2) {
        return goog.string.startsWith(expr1.asString(ctx), expr2.asString(ctx));
      }, 2),
  STRING: wgxpath.FunctionCall.createFunc_(
      'string', wgxpath.DataType.STRING, false, true, false,
      function(ctx, opt_expr) {
        return opt_expr ? opt_expr.asString(ctx) :
            wgxpath.Node.getValueAsString(ctx.getNode());
      }, 0, 1),
  STRING_LENGTH: wgxpath.FunctionCall.createFunc_('string-length',
      wgxpath.DataType.NUMBER, false, true, false,
      function(ctx, opt_expr) {
        var str = opt_expr ? opt_expr.asString(ctx) :
            wgxpath.Node.getValueAsString(ctx.getNode());
        return str.length;
      }, 0, 1),
  SUBSTRING: wgxpath.FunctionCall.createFunc_('substring',
      wgxpath.DataType.STRING, false, false, false,
      function(ctx, expr1, expr2, opt_expr3) {
        var startRaw = expr2.asNumber(ctx);
        if (isNaN(startRaw) || startRaw == Infinity || startRaw == -Infinity) {
          return '';
        }
        var lengthRaw = opt_expr3 ? opt_expr3.asNumber(ctx) : Infinity;
        if (isNaN(lengthRaw) || lengthRaw === -Infinity) {
          return '';
        }

        // XPath indices are 1-based.
        var startInt = Math.round(startRaw) - 1;
        var start = Math.max(startInt, 0);
        var str = expr1.asString(ctx);

        if (lengthRaw == Infinity) {
          return str.substring(start);
        } else {
          var lengthInt = Math.round(lengthRaw);
          // Length is from startInt, not start!
          return str.substring(start, startInt + lengthInt);
        }
      }, 2, 3),
  SUBSTRING_AFTER: wgxpath.FunctionCall.createFunc_('substring-after',
      wgxpath.DataType.STRING, false, false, false,
      function(ctx, expr1, expr2) {
        var str1 = expr1.asString(ctx);
        var str2 = expr2.asString(ctx);
        var str2Index = str1.indexOf(str2);
        return str2Index == -1 ? '' : str1.substring(str2Index + str2.length);
      }, 2),
  SUBSTRING_BEFORE: wgxpath.FunctionCall.createFunc_('substring-before',
      wgxpath.DataType.STRING, false, false, false,
      function(ctx, expr1, expr2) {
        var str1 = expr1.asString(ctx);
        var str2 = expr2.asString(ctx);
        var str2Index = str1.indexOf(str2);
        return str2Index == -1 ? '' : str1.substring(0, str2Index);
      }, 2),
  SUM: wgxpath.FunctionCall.createFunc_('sum',
      wgxpath.DataType.NUMBER, false, false, false,
      function(ctx, expr) {
        var ns = expr.evaluate(ctx);
        var iter = ns.iterator();
        var prev = 0;
        for (var node = iter.next(); node; node = iter.next()) {
          prev += wgxpath.Node.getValueAsNumber(node);
        }
        return prev;
      }, 1, 1, true),
  TRANSLATE: wgxpath.FunctionCall.createFunc_('translate',
      wgxpath.DataType.STRING, false, false, false,
      function(ctx, expr1, expr2, expr3) {
        var str1 = expr1.asString(ctx);
        var str2 = expr2.asString(ctx);
        var str3 = expr3.asString(ctx);

        var map = {};
        for (var i = 0; i < str2.length; i++) {
          var ch = str2.charAt(i);
          if (!(ch in map)) {
            // If i >= str3.length, charAt will return the empty string.
            map[ch] = str3.charAt(i);
          }
        }

        var translated = '';
        for (var i = 0; i < str1.length; i++) {
          var ch = str1.charAt(i);
          translated += (ch in map) ? map[ch] : ch;
        }
        return translated;
      }, 3),
  TRUE: wgxpath.FunctionCall.createFunc_(
      'true', wgxpath.DataType.BOOLEAN, false, false, false,
      function(ctx) {
        return true;
      }, 0)
};
