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
 * @fileoverview A recursive descent Parser.
 * @author evanrthomas@google.com (Evan Thomas)
 */

goog.provide('wgxpath.Parser');

goog.require('wgxpath.BinaryExpr');
goog.require('wgxpath.FilterExpr');
goog.require('wgxpath.FunctionCall');
goog.require('wgxpath.KindTest');
goog.require('wgxpath.Literal');
goog.require('wgxpath.NameTest');
goog.require('wgxpath.Number');
goog.require('wgxpath.PathExpr');
goog.require('wgxpath.Predicates');
goog.require('wgxpath.Step');
goog.require('wgxpath.UnaryExpr');
goog.require('wgxpath.UnionExpr');



/**
 * The recursive descent parser.
 *
 * @constructor
 * @param {!wgxpath.Lexer} lexer The lexer.
 * @param {function(string): ?string} nsResolver Namespace resolver.
 */
wgxpath.Parser = function(lexer, nsResolver) {

  /**
   * @private {!wgxpath.Lexer}
   */
  this.lexer_ = lexer;

  /**
   * @private {function(string): ?string}
   */
  this.nsResolver_ = nsResolver;
};


/**
 * Apply recursive descent parsing on the input to construct an
 * abstract syntax tree.
 *
 * @return {!wgxpath.Expr} The root of the constructed tree.
 */
wgxpath.Parser.prototype.parseExpr = function() {
  var expr, stack = [];
  while (true) {
    this.checkNotEmpty_('Missing right hand side of binary expression.');
    expr = this.parseUnaryExpr_(); // See if it's just a UnaryExpr.
    var opString = this.lexer_.next();
    if (!opString) {
      break; // Done, we have only a UnaryExpr.
    }

    var op = wgxpath.BinaryExpr.getOp(opString);
    var precedence = op && op.getPrecedence();
    if (!precedence) {
      this.lexer_.back();
      break;
    }
    // Precedence climbing
    while (stack.length &&
        precedence <= stack[stack.length - 1].getPrecedence()) {
      expr = new wgxpath.BinaryExpr(stack.pop(), stack.pop(), expr);
    }
    stack.push(expr, op);
  }
  while (stack.length) {
    expr = new wgxpath.BinaryExpr(stack.pop(), stack.pop(),
        /** @type {!wgxpath.Expr} */ (expr));
  }
  return /** @type {!wgxpath.Expr} */ (expr);
};


/**
 * Checks that the lexer is not empty,
 *     displays the given error message if it is.
 *
 * @private
 * @param {string} msg The error message to display.
 */
wgxpath.Parser.prototype.checkNotEmpty_ = function(msg) {
  if (this.lexer_.empty()) {
    throw Error(msg);
  }
};


/**
 * Checks that the next token of the error message is the expected token.
 *
 * @private
 * @param {string} expected The expected token.
 */
wgxpath.Parser.prototype.checkNextEquals_ = function(expected) {
  var got = this.lexer_.next();
  if (got != expected) {
    throw Error('Bad token, expected: ' + expected + ' got: ' + got);
  }
};


/**
 * Checks that the next token of the error message is not the given token.
 *
 * @private
 * @param {string} token The token.
 */
wgxpath.Parser.prototype.checkNextNotEquals_ = function(token) {
  var next = this.lexer_.next();
  if (next != token) {
    throw Error('Bad token: ' + next);
  }
};


/**
 * Attempts to parse the input as a FilterExpr.
 *
 * @private
 * @return {wgxpath.Expr} The root of the constructed tree.
 */
wgxpath.Parser.prototype.parseFilterExpr_ = function() {
  var expr;
  var token = this.lexer_.peek();
  var ch = token.charAt(0);
  switch (ch) {
    case '$':
      throw Error('Variable reference not allowed in HTML XPath');
    case '(':
      this.lexer_.next();
      expr = this.parseExpr();
      this.checkNotEmpty_('unclosed "("');
      this.checkNextEquals_(')');
      break;
    case '"':
    case "'":
      expr = this.parseLiteral_();
      break;
    default:
      if (!isNaN(+token)) {
        expr = this.parseNumber_();
      } else if (wgxpath.KindTest.isValidType(token)) {
        return null;
      } else if (/(?![0-9])[\w]/.test(ch) && this.lexer_.peek(1) == '(') {
        expr = this.parseFunctionCall_();
      } else {
        return null;
      }
  }
  if (this.lexer_.peek() != '[') {
    return expr;
  }
  var predicates = new wgxpath.Predicates(this.parsePredicates_());
  return new wgxpath.FilterExpr(expr, predicates);
};


/**
 * Parses FunctionCall.
 *
 * @private
 * @return {!wgxpath.FunctionCall} The parsed expression.
 */
wgxpath.Parser.prototype.parseFunctionCall_ = function() {
  var funcName = this.lexer_.next();
  var func = wgxpath.FunctionCall.getFunc(funcName);
  this.lexer_.next();

  var args = [];
  while (this.lexer_.peek() != ')') {
    this.checkNotEmpty_('Missing function argument list.');
    args.push(this.parseExpr());
    if (this.lexer_.peek() != ',') {
      break;
    }
    this.lexer_.next();
  }
  this.checkNotEmpty_('Unclosed function argument list.');
  this.checkNextNotEquals_(')');

  return new wgxpath.FunctionCall(func, args);
};


/**
 * Parses the input to construct a KindTest.
 *
 * @private
 * @return {!wgxpath.KindTest} The KindTest constructed.
 */
wgxpath.Parser.prototype.parseKindTest_ = function() {
  var typeName = this.lexer_.next();
  if (!wgxpath.KindTest.isValidType(typeName)) {
    throw Error('Invalid type name: ' + typeName);
  }
  this.checkNextEquals_('(');
  this.checkNotEmpty_('Bad nodetype');
  var ch = this.lexer_.peek().charAt(0);

  var literal = null;
  if (ch == '"' || ch == "'") {
    literal = this.parseLiteral_();
  }
  this.checkNotEmpty_('Bad nodetype');
  this.checkNextNotEquals_(')');
  return new wgxpath.KindTest(typeName, literal);
};


/**
 * Parses the input to construct a Literal.
 *
 * @private
 * @return {!wgxpath.Literal} The Literal constructed.
 */
wgxpath.Parser.prototype.parseLiteral_ = function() {
  var token = this.lexer_.next();
  if (token.length < 2) {
    throw Error('Unclosed literal string');
  }
  return new wgxpath.Literal(token);
};


/**
 * Parses the input to construct a NameTest.
 *
 * @private
 * @return {!wgxpath.NameTest} The NameTest constructed.
 */
wgxpath.Parser.prototype.parseNameTest_ = function() {
  var name = this.lexer_.next();

  // Check whether there's a namespace prefix.
  var colonIndex = name.indexOf(':');
  if (colonIndex == -1) {
    return new wgxpath.NameTest(name);
  } else {
    var namespacePrefix = name.substring(0, colonIndex);
    var namespaceUri;
    if (namespacePrefix == wgxpath.NameTest.WILDCARD) {
      namespaceUri = wgxpath.NameTest.WILDCARD;
    } else {
      namespaceUri = this.nsResolver_(namespacePrefix);
      if (!namespaceUri) {
        throw Error('Namespace prefix not declared: ' + namespacePrefix);
      }
    }
    name = name.substr(colonIndex + 1);
    return new wgxpath.NameTest(name, namespaceUri);
  }
};


/**
 * Parses the input to construct a Number.
 *
 * @private
 * @return {!wgxpath.Number} The Number constructed.
 */
wgxpath.Parser.prototype.parseNumber_ = function() {
  return new wgxpath.Number(+this.lexer_.next());
};


/**
 * Attempts to parse the input as a PathExpr.
 *
 * @private
 * @return {!wgxpath.Expr} The root of the constructed tree.
 */
wgxpath.Parser.prototype.parsePathExpr_ = function() {
  var op, expr;
  var steps = [];
  var filterExpr;
  if (wgxpath.PathExpr.isValidOp(this.lexer_.peek())) {
    op = this.lexer_.next();
    var token = this.lexer_.peek();
    if (op == '/' && (this.lexer_.empty() ||
        (token != '.' && token != '..' && token != '@' && token != '*' &&
        !/(?![0-9])[\w]/.test(token)))) {
      return new wgxpath.PathExpr.RootHelperExpr();
    }
    filterExpr = new wgxpath.PathExpr.RootHelperExpr();

    this.checkNotEmpty_('Missing next location step.');
    expr = this.parseStep_(op);
    steps.push(expr);
  } else {
    expr = this.parseFilterExpr_();
    if (!expr) {
      expr = this.parseStep_('/');
      filterExpr = new wgxpath.PathExpr.ContextHelperExpr();
      steps.push(expr);
    } else if (!wgxpath.PathExpr.isValidOp(this.lexer_.peek())) {
      return expr; // Done.
    } else {
      filterExpr = expr;
    }
  }
  while (true) {
    if (!wgxpath.PathExpr.isValidOp(this.lexer_.peek())) {
      break;
    }
    op = this.lexer_.next();
    this.checkNotEmpty_('Missing next location step.');
    expr = this.parseStep_(op);
    steps.push(expr);
  }
  return new wgxpath.PathExpr(filterExpr, steps);
};


/**
 * Parses Step.
 *
 * @private
 * @param {string} op The op for this step.
 * @return {!wgxpath.Step} The parsed expression.
 */
wgxpath.Parser.prototype.parseStep_ = function(op) {
  var test, step, token, predicates;
  if (op != '/' && op != '//') {
    throw Error('Step op should be "/" or "//"');
  }
  if (this.lexer_.peek() == '.') {
    step = new wgxpath.Step(wgxpath.Step.Axis.SELF,
        new wgxpath.KindTest('node'));
    this.lexer_.next();
    return step;
  }
  else if (this.lexer_.peek() == '..') {
    step = new wgxpath.Step(wgxpath.Step.Axis.PARENT,
        new wgxpath.KindTest('node'));
    this.lexer_.next();
    return step;
  } else {
    // Grab the axis.
    var axis;
    if (this.lexer_.peek() == '@') {
      axis = wgxpath.Step.Axis.ATTRIBUTE;
      this.lexer_.next();
      this.checkNotEmpty_('Missing attribute name');
    } else {
      if (this.lexer_.peek(1) == '::') {
        if (!/(?![0-9])[\w]/.test(this.lexer_.peek().charAt(0))) {
          throw Error('Bad token: ' + this.lexer_.next());
        }
        var axisName = this.lexer_.next();
        axis = wgxpath.Step.getAxis(axisName);
        if (!axis) {
          throw Error('No axis with name: ' + axisName);
        }
        this.lexer_.next();
        this.checkNotEmpty_('Missing node name');
      } else {
        axis = wgxpath.Step.Axis.CHILD;
      }
    }

    // Grab the test.
    token = this.lexer_.peek();
    if (!/(?![0-9])[\w\*]/.test(token.charAt(0))) {
      throw Error('Bad token: ' + this.lexer_.next());
    } else {
      if (this.lexer_.peek(1) == '(') {
        if (!wgxpath.KindTest.isValidType(token)) {
          throw Error('Invalid node type: ' + token);
        }
        test = this.parseKindTest_();
      } else {
        test = this.parseNameTest_();
      }
    }
    predicates = new wgxpath.Predicates(this.parsePredicates_(),
        axis.isReverse());
    return step || new wgxpath.Step(axis, test, predicates, op == '//');
  }
};


/**
 * Parses and returns the predicates from the this.lexer_.
 *
 * @private
 * @return {!Array.<!wgxpath.Expr>} An array of the predicates.
 */
wgxpath.Parser.prototype.parsePredicates_ = function() {
  var predicates = [];
  while (this.lexer_.peek() == '[') {
    this.lexer_.next();
    this.checkNotEmpty_('Missing predicate expression.');
    var predicate = this.parseExpr();
    predicates.push(predicate);
    this.checkNotEmpty_('Unclosed predicate expression.');
    this.checkNextEquals_(']');
  }
  return predicates;
};


/**
 * Attempts to parse the input as a unary expression with
 * recursive descent parsing.
 *
 * @private
 * @return {!wgxpath.Expr} The root of the constructed tree.
 */
wgxpath.Parser.prototype.parseUnaryExpr_ = function() {
  if (this.lexer_.peek() == '-') {
    this.lexer_.next();
    return new wgxpath.UnaryExpr(this.parseUnaryExpr_());
  } else {
    return this.parseUnionExpr_();
  }
};


/**
 * Attempts to parse the input as a union expression with
 * recursive descent parsing.
 *
 * @private
 * @return {!wgxpath.Expr} The root of the constructed tree.
 */
wgxpath.Parser.prototype.parseUnionExpr_ = function() {
  var expr = this.parsePathExpr_();
  if (!(this.lexer_.peek() == '|')) {
    return expr;  // Not a UnionExpr, returning as is.
  }
  var paths = [expr];
  while (this.lexer_.next() == '|') {
    this.checkNotEmpty_('Missing next union location path.');
    paths.push(this.parsePathExpr_());
  }
  this.lexer_.back();
  return new wgxpath.UnionExpr(paths);
};
