// This requires strands.js
 /* ***** BEGIN LICENSE BLOCK *****
  * Version: MPL 1.1/GPL 2.0/LGPL 2.1
  *
  * The contents of this file are subject to the Mozilla Public License Version
  * 1.1 (the "License"); you may not use this file except in compliance with
  * the License. You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
  *
  * Software distributed under the License is distributed on an "AS IS" basis,
  * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  * for the specific language governing rights and limitations under the
  * License.
  *
  * The Original Code is the Narcissus JavaScript engine.
  *
  * The Initial Developer of the Original Code is
  * Brendan Eich <brendan@mozilla.org>.
  * Portions created by the Initial Developer are Copyright (C) 2004
  * the Initial Developer. All Rights Reserved.
  *
  * Contributor(s):
  *
  * Alternatively, the contents of this file may be used under the terms of
  * either the GNU General Public License Version 2 or later (the "GPL"), or
  * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  * in which case the provisions of the GPL or the LGPL are applicable instead
  * of those above. If you wish to allow use of your version of this file only
  * under the terms of either the GPL or the LGPL, and not to allow others to
  * use your version of this file under the terms of the MPL, indicate your
  * decision by deleting the provisions above and replace them with the notice
  * and other provisions required by the GPL or the LGPL. If you do not delete
  * the provisions above, a recipient may use your version of this file under
  * the terms of any one of the MPL, the GPL or the LGPL.
  *
  * ***** END LICENSE BLOCK ***** */
 
 /*
  * Narcissus - JS implemented in JS.
  *
  * Well-known constants and lookup tables.  Many consts are generated from the
  * tokens table via eval to minimize redundancy, so consumers must be compiled
  * separately to take advantage of the simple switch-case constant propagation
  * done by SpiderMonkey.
  */
 
 /*
  * Authenteo edit:
  * Added the # operators
  * strands edit:
  * - Neil: combine jsdefs.js and jsparse.js into a single file as part of an
  *   effort to reduce namespace pollution.
  * - Neil: make opTypeName order explicit for env compatibility.  The original
  *   source relied on a SpiderMonkey specific behavior where object key
  *   iteration occurs in the same order in which the keys were defined in 
  *   the object.
 Ê* - Neil: perf optimizations for OOM+ parse speedup
 Ê* - Neil: make code x-env-compatible
 Ê* - chocolateboy 2006-06-01: add support for $ in identifiers and remove support for ` as the first character as per:
 Ê* Ê http://www.mozilla.org/js/language/es4/formal/lexer-semantics.html#N-InitialIdentifierCharacter and
 Ê* Ê http://www.mozilla.org/js/language/es4/formal/lexer-semantics.html#N-ContinuingIdentifierCharacter
  */

Narcissus = {};

(function() {

	// EDIT: remove references to global to avoid namespace pollution

	 // EDIT: add yielding op
	 var tokens = [
		 // End of source.
		 "END",
	 
		 // Operators and punctuators.  Some pair-wise order matters, e.g. (+, -)
		 // and (UNARY_PLUS, UNARY_MINUS).
		 "\n", ";",
		 ",",
		 "=",
		 "?", ":", "CONDITIONAL",
		 "||",
		 "&&",
		 "|",
		 "^",
		 "&",
		 "->",
		 "==", "!=", "===", "!==",
		 "<", "<=", ">=", ">",
		 "<<", ">>", ">>>",
		 "+", "-",
		 "*", "/", "%",
		 "#","!", "~", "UNARY_PLUS", "UNARY_MINUS",
		 "++", "--",
		 ".",".#",
		 "#[", "[", "]",
		 "{", "}",
		 "(", ")",
	 
		 // Nonterminal tree node type codes.
		 "SCRIPT", "BLOCK", "LABEL", "FOR_IN", "CALL", "NEW_WITH_ARGS", "INDEX", "TRANSIENT_INDEX",
		 "ARRAY_INIT", "OBJECT_INIT", "PROPERTY_INIT", "GETTER", "SETTER",
		 "GROUP", "LIST",
	 
		 // Terminals.
		 "IDENTIFIER", "NUMBER", "STRING", "REGEXP",
	 
		 // Keywords.
		 "break",
		 "case", "catch", "const", "continue",
		 "debugger", "default", "delete", "do",
		 "else", "enum",
		 "false", "finally", "for", "function",
		 "if", "in", "instanceof", "is",
		 "new", "null",
		 "return",
		 "switch",
		 "this", "throw", "true", "try", "typeof",
		 "var", "void",
		 "while", "with" // EDIT: remove trailing comma (breaks IE)
	 ];
	 
	 // Operator and punctuator mapping from token to tree node type name.
	 // NB: superstring tokens (e.g., ++) must come before their substring token
	 // counterparts (+ in the example), so that the opRegExp regular expression
	 // synthesized from this list makes the longest possible match.
	// EDIT: NB comment above indicates reliance on SpiderMonkey-specific
	//       behavior in the ordering of key iteration -- see EDIT below.
	// EDIT: add yeilding op
	 var opTypeNames = {
		 '\n':   "NEWLINE",
		 ';':    "SEMICOLON",
		 ',':    "COMMA",
		 '?':    "HOOK",
		 ':':    "COLON",
		 '||':   "OR",
		 '&&':   "AND",
		 '|':    "BITWISE_OR",
		 '^':    "BITWISE_XOR",
		 '&':    "BITWISE_AND",
		 '->':   "YIELDING",
		 '===':  "STRICT_EQ",
		 '==':   "EQ",
		 '=':    "ASSIGN",
		 '!==':  "STRICT_NE",
		 '!=':   "NE",
		 '<<':   "LSH",
		 '<=':   "LE",
		 '<':    "LT",
		 '>>>':  "URSH",
		 '>>':   "RSH",
		 '>=':   "GE",
		 '>':    "GT",
		 '++':   "INCREMENT",
		 '--':   "DECREMENT",
		 '+':    "PLUS",
		 '-':    "MINUS",
		 '*':    "MUL",
		 '/':    "DIV",
		 '%':    "MOD",
		 '#': "OBJECT_ID_REFERENCE",
		 '!':    "NOT",
		 '~':    "BITWISE_NOT",
		 '.#':    "TRANSIENT_DOT",
		 '.':    "DOT",
		 '#[':    "TRANSIENT_LEFT_BRACKET",
		 '[':    "LEFT_BRACKET",
		 ']':    "RIGHT_BRACKET",
		 '{':    "LEFT_CURLY",
		 '}':    "RIGHT_CURLY",
		 '(':    "LEFT_PAREN",
		 ')':    "RIGHT_PAREN"
	 };
	
	// EDIT: created separate opTypeOrder array to indicate the order in which
	//       to evaluate opTypeNames.  (Apparently, SpiderMonkey must iterate
	//       hash keys in the order in which they are defined, an implementation
	//       detail which the original narcissus code relied on.)
	// EDIT: add yielding op
	 var opTypeOrder = [
		 '\n',
		 ';',
		 ',',
		 '?',
		 ':',
		 '||',
		 '&&',
		 '|',
		 '^',
		 '&',
		 '->',
		 '===',
		 '==',
		 '=',
		 '!==',
		 '!=',
		 '<<',
		 '<=',
		 '<',
		 '>>>',
		 '>>',
		 '>=',
		 '>',
		 '++',
		 '--',
		 '+',
		 '-',
		 '*',
		 '/',
		 '%',
		 '#',
		 '!',
		 '~',
		 '.#',
		 '.',
		 '#[',
		 '[',
		 ']',
		 '{',
		 '}',
		 '(',
		 ')'
	 ];
	 
	 // Hash of keyword identifier to tokens index.  NB: we must null __proto__ to
	 // avoid toString, etc. namespace pollution.
	 var keywords = {__proto__: null};
	 
	 // Define const END, etc., based on the token names.  Also map name to index.
	 // EDIT: use "var " prefix to make definitions local to this function
	 var consts = "var ";
	 for (var i = 0, j = tokens.length; i < j; i++) {
		 if (i > 0)
			 consts += ", ";
		 var t = tokens[i];
		 var name;
		 if (/^[a-z]/.test(t)) {
			 name = t.toUpperCase();
			 keywords[t] = i;
		 } else {
			 name = (/^\W/.test(t) ? opTypeNames[t] : t);
		 }
		 consts += name + " = " + i;
		 this[name] = i;
		 tokens[t] = i;
	 }
	 eval(consts + ";");
	 
	 // Map assignment operators to their indexes in the tokens array.
	 var assignOps = ['|', '^', '&', '<<', '>>', '>>>', '+', '-', '*', '/', '%'];
	 
	 for (i = 0, j = assignOps.length; i < j; i++) {
		 t = assignOps[i];
		 assignOps[t] = tokens[t];
	 }
	 /* vim: set sw=4 ts=8 et tw=80: */
	 /* ***** BEGIN LICENSE BLOCK *****
	  * Version: MPL 1.1/GPL 2.0/LGPL 2.1
	  *
	  * The contents of this file are subject to the Mozilla Public License Version
	  * 1.1 (the "License"); you may not use this file except in compliance with
	  * the License. You may obtain a copy of the License at
	  * http://www.mozilla.org/MPL/
	  *
	  * Software distributed under the License is distributed on an "AS IS" basis,
	  * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
	  * for the specific language governing rights and limitations under the
	  * License.
	  *
	  * The Original Code is the Narcissus JavaScript engine.
	  *
	  * The Initial Developer of the Original Code is
	  * Brendan Eich <brendan@mozilla.org>.
	  * Portions created by the Initial Developer are Copyright (C) 2004
	  * the Initial Developer. All Rights Reserved.
	  *
	  * Contributor(s):
	  *
	  * Alternatively, the contents of this file may be used under the terms of
	  * either the GNU General Public License Version 2 or later (the "GPL"), or
	  * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
	  * in which case the provisions of the GPL or the LGPL are applicable instead
	  * of those above. If you wish to allow use of your version of this file only
	  * under the terms of either the GPL or the LGPL, and not to allow others to
	  * use your version of this file under the terms of the MPL, indicate your
	  * decision by deleting the provisions above and replace them with the notice
	  * and other provisions required by the GPL or the LGPL. If you do not delete
	  * the provisions above, a recipient may use your version of this file under
	  * the terms of any one of the MPL, the GPL or the LGPL.
	  *
	  * ***** END LICENSE BLOCK ***** */
	 
	 /*
	  * Narcissus - JS implemented in JS.
	  *
	  * Lexical scanner and parser.
	  */
	  
	  
	 // Build a regexp that recognizes operators and punctuators (except newline).
	 var opRegExpSrc = "^(?:";
	 
	 // EDIT: change for loop from iterating through opTypeNames keys to using
	 //       opTypeOrder array so that we're not dependent on SpiderMonkey's
	 //       key order default behavior.
	 // EDIT: change regex structure for OOM perf improvement
	 for (var i = 0; i < opTypeOrder.length; i++) {
		 var op = opTypeOrder[i];
		 if (op == '\n')
			 continue;
		 if (opRegExpSrc != "^(?:")
			 opRegExpSrc += "|";
		 
		 // EDIT: expand out this regexp for environments that don't support $&
		 //opRegExpSrc += op.replace(/[?|^&(){}\[\]+\-*\/\.]/g, "\\$&");
		 op = op.replace(/\?/g, "\\?");
		 op = op.replace(/\|/g, "\\|");
		 op = op.replace(/\^/g, "\\^");
		 op = op.replace(/\&/g, "\\&");
		 op = op.replace(/\(/g, "\\(");
		 op = op.replace(/\)/g, "\\)");
		 op = op.replace(/\{/g, "\\{");
		 op = op.replace(/\}/g, "\\}");
		 op = op.replace(/\[/g, "\\[");
		 op = op.replace(/\]/g, "\\]");
		 op = op.replace(/\+/g, "\\+");
		 op = op.replace(/\-/g, "\\-");
		 op = op.replace(/\*/g, "\\*");
		 op = op.replace(/\//g, "\\/");
		 op = op.replace(/\./g, "\\.");
		 opRegExpSrc += op;
	 }
	 opRegExpSrc += ")";
	 var opRegExp = new RegExp(opRegExpSrc);
	 
	 // A regexp to match floating point literals (but not integer literals).
	 // EDIT: change regex structure for OOM perf improvement
	 var fpRegExp = /^(?:\d+\.\d*(?:[eE][-+]?\d+)?|\d+(?:\.\d*)?[eE][-+]?\d+|\.\d+(?:[eE][-+]?\d+)?)/;
	 
	 function Tokenizer(s, f, l) {
		 this.cursor = 0;
		 this.source = String(s);
		 this.tokens = [];
		 this.tokenIndex = 0;
		 this.lookahead = 0;
		 this.scanNewlines = false;
		 this.scanOperand = true;
		 this.filename = f || "";
		 this.lineno = l ? l : 1;
	 }
	  
	 Tokenizer.prototype = {
	 
	 // EDIT: change "input" from a getter to a regular method for compatibility
	 //       with older JavaScript versions
		 input: function() {
			 return this.source.substring(this.cursor);
		 },
	 
	 // EDIT: change "done" from a getter to a regular method for compatibility
	 //       with older JavaScript versions
		 done: function() {
			 return this.peek() == END;
		 },
	 
	 // EDIT: change "token" from a getter to a regular method for compatibility
	 //       with older JavaScript versions
		 token: function() {
			 return this.tokens[this.tokenIndex];
		 },
	 
		 match: function (tt) {
			 return this.get() == tt || this.unget();
		 },
	 
		 mustMatch: function (tt) {
			 if (!this.match(tt)) {
				 throw this.newSyntaxError("Missing " + tokens[tt].toLowerCase());
			 }
			 return this.token();
		 },
	 
		 peek: function () {
			 var tt;
			 if (this.lookahead) {
				 tt = this.tokens[(this.tokenIndex + this.lookahead) & 3].type;
			 } else {
				 tt = this.get();
				 this.unget();
			 }
			 return tt;
		 },
	 
		 peekOnSameLine: function () {
			 this.scanNewlines = true;
			 var tt = this.peek();
			 this.scanNewlines = false;
			 return tt;
		 },
	 
		 get: function () {
			 var token;
			 while (this.lookahead) {
				 --this.lookahead;
				 this.tokenIndex = (this.tokenIndex + 1) & 3;
				 token = this.tokens[this.tokenIndex];
				 if (token.type != NEWLINE || this.scanNewlines)
					 return token.type;
			 }
	 
			 for (;;) {
				 var input = this.input();
				 var firstChar = input.charCodeAt(0);
				 // EDIT: check first char, then use regex
				 // valid regex whitespace includes char codes: 9 10 11 12 13 32
				 if(firstChar == 32 || (firstChar >= 9 && firstChar <= 13)) {
					 var match = input.match(this.scanNewlines ? /^[ \t]+/ : /^\s+/); // EDIT: use x-browser regex syntax
					 if (match) {
						 var spaces = match[0];
						 this.cursor += spaces.length;
						 var newlines = spaces.match(/\n/g);
						 if (newlines)
							 this.lineno += newlines.length;
						 input = this.input();
					}
				 }
	 
				 // EDIT: improve perf by checking first string char before proceeding to regex,
				 //       use x-browser regex syntax
				 if (input.charCodeAt(0) != 47 || !(match = input.match(/^\/(?:\*(?:.|\n)*?\*\/|\/.*)/)))
					 break;
				 var comment = match[0];
				 this.cursor += comment.length;
				 newlines = comment.match(/\n/g);
				 if (newlines)
					 this.lineno += newlines.length
			 }
	 
			 this.tokenIndex = (this.tokenIndex + 1) & 3;
			 token = this.tokens[this.tokenIndex];
			 if (!token)
				 this.tokens[this.tokenIndex] = token = {};
	 
			 if (!input)
				 return token.type = END;
	
			 var firstChar = input.charCodeAt(0);
			 
			 // EDIT: guard by checking char codes before going to regex
			 if ((firstChar == 46 || (firstChar > 47 && firstChar < 58)) && 
				 (match = input.match(fpRegExp))) { // EDIT: use x-browser regex syntax
				 token.type = NUMBER;
				 token.value = parseFloat(match[0]);
			 } else if ((firstChar > 47 && firstChar < 58) && 
						(match = input.match(/^(?:0[xX][\da-fA-F]+|0[0-7]*|\d+)/))) { // EDIT: change regex structure for OOM perf improvement,
																					  //       use x-browser regex syntax
				 token.type = NUMBER;
				 token.value = parseInt(match[0]);
			 } else if (((firstChar > 47 && firstChar < 58)  ||   // EDIT: add guards to check before using regex
						 (firstChar > 64 && firstChar < 91)  || 
						 (firstChar > 96 && firstChar < 123) ||   // EDIT: exclude `
						 (firstChar == 36 || firstChar == 95)) && // EDIT: allow $ + mv _ here
						(match = input.match(/^[$\w]+/))) {       // EDIT: allow $, use x-browser regex syntax
				 var id = match[0];
				 // EDIT: check the type of the value in the keywords hash, as different envs
				 //       expose implicit Object properties that SpiderMonkey does not.
				 token.type = typeof(keywords[id]) == "number" ? keywords[id] : IDENTIFIER;
				 token.value = id;
			 } else if ((firstChar == 34 || firstChar == 39) && 
						(match = input.match(/^(?:"(?:\\.|[^"])*"|'(?:[^']|\\.)*')/))) { //"){  // EDIT: change regex structure for OOM perf improvement,
																								//       use x-browser regex syntax
				 token.type = STRING;
				 token.value = eval(match[0]);
			 } else if (this.scanOperand && firstChar == 47 && // EDIT: improve perf by guarding with first char check
						(match = input.match(/^\/((?:\\.|[^\/])+)\/([gi]*)/))) { // EDIT: use x-browser regex syntax
				 token.type = REGEXP;
				 token.value = new RegExp(match[1], match[2]);
			 } else if ((match = input.match(opRegExp))) { // EDIT: use x-browser regex syntax
				 var op = match[0];
				 // EDIT: IE doesn't support indexing of strings -- use charAt
				 if (assignOps[op] && input.charAt(op.length) == '=') {
					 token.type = ASSIGN;
					 token.assignOp = eval(opTypeNames[op]);
					 match[0] += '=';
				 } else {
					 token.type = eval(opTypeNames[op]);
					 if (this.scanOperand &&
						 (token.type == PLUS || token.type == MINUS)) {
						 token.type += UNARY_PLUS - PLUS;
					 }
					 token.assignOp = null;
				 }
				 token.value = op;
			 } else {
				 throw this.newSyntaxError("Illegal token");
			 }
	
			 token.start = this.cursor;
			 this.cursor += match[0].length;
			 token.end = this.cursor;
			 token.lineno = this.lineno;
			 return token.type;
		 },
	 
		 unget: function () {
			 if (++this.lookahead == 4) throw "PANIC: too much lookahead!";
			 this.tokenIndex = (this.tokenIndex - 1) & 3;
		 },
	 
		 newSyntaxError: function (m) {
			 var e = new SyntaxError(m, this.filename, this.lineno);
			 e.lineNumber = this.lineno; // EDIT: x-browser exception handling
			 e.source = this.source;
			 e.cursor = this.cursor;
			 return e;
		 }
	 };
	 
	 function CompilerContext(inFunction) {
		 this.inFunction = inFunction;
		 this.stmtStack = [];
		 this.funDecls = [];
		 this.varDecls = [];
	 }
	 
	 var CCp = CompilerContext.prototype;
	 CCp.bracketLevel = CCp.curlyLevel = CCp.parenLevel = CCp.hookLevel = 0;
	 CCp.ecmaStrictMode = CCp.inForLoopInit = false;
	 
	 function Script(t, x) {
		 var n = Statements(t, x);
		 n.type = SCRIPT;
		 n.funDecls = x.funDecls;
		 n.varDecls = x.varDecls;
		 return n;
	 }
	 
	// EDIT: change "top" method to be a regular method, rather than defined
	//       via the SpiderMonkey-specific __defineProperty__
	
	 // Node extends Array, which we extend slightly with a top-of-stack method.
	 Array.prototype.top = function() {
		return this.length && this[this.length-1];
	 }
	 
	 function Node(t, type) {
		 // EDIT: "inherit" from Array in an x-browser way.
		 var _this = [];
		 for (var n in Node.prototype)
		 	_this[n] = Node.prototype[n];

		 _this.constructor = Node;

		 var token = t.token();
		 if (token) {
			 _this.type = type || token.type;
			 _this.value = token.value;
			 _this.lineno = token.lineno;
			 _this.start = token.start;
			 _this.end = token.end;
		 } else {
			 _this.type = type;
			 _this.lineno = t.lineno;
		 }
		 _this.tokenizer = t;
	 
		 for (var i = 2; i < arguments.length; i++) 
			_this.push(arguments[i]);
		
		 return _this;
	 }
	 
	 var Np = Node.prototype; // EDIT: don't inherit from array
	 Np.toSource = Object.prototype.toSource;
	 	
	 // Always use push to add operands to an expression, to update start and end.
	 Np.push = function (kid) {
		 if (kid.start < this.start)
			 this.start = kid.start;
		 if (this.end < kid.end)
			 this.end = kid.end;
	
		 this[this.length] = kid;
	 }
	 
	 Node.indentLevel = 0;
	 
	 Np.toString = function () {
		 var a = [];
		 for (var i in this) {
			 if (this.hasOwnProperty(i) && i != 'type' && i != 'parent' && typeof(this[i]) != 'function') {
				 // EDIT,BUG: add check for 'target' to prevent infinite recursion
				 if(i != 'target')
					 a.push({id: i, value: this[i]});
				 else
					 a.push({id: i, value: "[token: " + this[i].value + "]"});
			 }
					
		 }
		 a.sort(function (a,b) { return (a.id < b.id) ? -1 : 1; });
		 INDENTATION = "    ";
		 var n = ++Node.indentLevel;
		 var t = tokens[this.type];
		 var s = "{\n" + INDENTATION.repeat(n) +
				 "type: " + (/^\W/.test(t) ? opTypeNames[t] : t.toUpperCase());
		 for (i = 0; i < a.length; i++) {
			 s += ",\n" + INDENTATION.repeat(n) + a[i].id + ": " + a[i].value;}
		 n = --Node.indentLevel;
		 s += "\n" + INDENTATION.repeat(n) + "}";
		 return s;
	 }
	 
	 Np.getSource = function () {
		 return this.tokenizer.source.slice(this.start, this.end);
	 };
	 
	// EDIT: change "filename" method to be a regular method, rather than defined
	//       via the SpiderMonkey-specific __defineGetter__
	 Np.filename = function () { return this.tokenizer.filename; };
	 
	 String.prototype.repeat = function (n) {
		 var s = "", t = this + s;
		 while (--n >= 0)
			 s += t;
		 return s;
	 }
	 
	 // Statement stack and nested statement handler.
	 function nest(t, x, node, func, end) {
		 x.stmtStack.push(node);
		 var n = func(t, x);
		 x.stmtStack.pop();
		 end && t.mustMatch(end);
		 return n;
	 }
	 
	 function Statements(t, x) {
		 var n = Node(t, BLOCK);
		 x.stmtStack.push(n);
		 while (!t.done() && t.peek() != RIGHT_CURLY) 
			 n.push(Statement(t, x));
		 x.stmtStack.pop();
		 return n;
	 }
	 
	 function Block(t, x) {
		t.mustMatch(LEFT_CURLY);
		 var n = Statements(t, x);
		 t.mustMatch(RIGHT_CURLY);
		 return n;
	 }
	 
	 var DECLARED_FORM = 0, EXPRESSED_FORM = 1, STATEMENT_FORM = 2;
	 
	 function Statement(t, x) {
		 var i, label, n, n2, ss, tt = t.get();
	 
		 // Cases for statements ending in a right curly return early, avoiding the
		 // common semicolon insertion magic after this switch.
		switch (tt) {
		   case FUNCTION:
			 return FunctionDefinition(t, x, true,DECLARED_FORM);
									   /*(x.stmtStack.length > 1)
									   ? STATEMENT_FORM
									   : DECLARED_FORM);*/
	 
		   case LEFT_CURLY:
			 n = Statements(t, x);
			 t.mustMatch(RIGHT_CURLY);
			 return n;
	 
		   case IF:
			 n = Node(t);
			 n.condition = ParenExpression(t, x);
			 x.stmtStack.push(n);
			 n.thenPart = Statement(t, x);
			 n.elsePart = t.match(ELSE) ? Statement(t, x) : null;
			 x.stmtStack.pop();
			 return n;
	 
		   case SWITCH:
			 n = Node(t);
			 t.mustMatch(LEFT_PAREN);
			 n.discriminant = Expression(t, x);
			 t.mustMatch(RIGHT_PAREN);
			 n.cases = [];
			 n.defaultIndex = -1;
			 x.stmtStack.push(n);
			 t.mustMatch(LEFT_CURLY);
			 while ((tt = t.get()) != RIGHT_CURLY) {
				 switch (tt) {
				   case DEFAULT:
					 if (n.defaultIndex >= 0)
						 throw t.newSyntaxError("More than one switch default");
					 // FALL THROUGH
				   case CASE:
					 n2 = Node(t);
					 if (tt == DEFAULT)
						 n.defaultIndex = n.cases.length;
					 else
						 n2.caseLabel = Expression(t, x, COLON);
					 break;
				   default:
					 throw t.newSyntaxError("Invalid switch case");
				 }
				 t.mustMatch(COLON);
				 n2.statements = Node(t, BLOCK);
				 while ((tt=t.peek()) != CASE && tt != DEFAULT && tt != RIGHT_CURLY)
					 n2.statements.push(Statement(t, x));
				 n.cases.push(n2);
			 }
			 x.stmtStack.pop();
			 return n;
	 
		   case FOR:
			 n = Node(t);
			 n.isLoop = true;
			 t.mustMatch(LEFT_PAREN);
			 if ((tt = t.peek()) != SEMICOLON) {
				 x.inForLoopInit = true;
				 if (tt == VAR || tt == CONST) {
					 t.get();
					 n2 = Variables(t, x);
				 } else {
					 n2 = Expression(t, x);
				 }
				 x.inForLoopInit = false;
			 }
			 if (n2 && t.match(IN)) {
				 n.type = FOR_IN;
				 if (n2.type == VAR) {
					 if (n2.length != 1) {
						 throw new SyntaxError("Invalid for..in left-hand side",
											   t.filename, n2.lineno);
					 }
	 
					 // NB: n2[0].type == IDENTIFIER and n2[0].value == n2[0].name.
					 n.iterator = n2[0];
					 n.varDecl = n2;
				 } else {
					 n.iterator = n2;
					 n.varDecl = null;
				 }
				 n.object = Expression(t, x);
			 } else {
				 n.setup = n2 || null;
				 t.mustMatch(SEMICOLON);
				 n.condition = (t.peek() == SEMICOLON) ? null : Expression(t, x);
				 t.mustMatch(SEMICOLON);
				 n.update = (t.peek() == RIGHT_PAREN) ? null : Expression(t, x);
			 }
			 t.mustMatch(RIGHT_PAREN);
			 n.body = nest(t, x, n, Statement);
			 return n;
	 
		   case WHILE:
			 n = Node(t);
			 n.isLoop = true;
			 n.condition = ParenExpression(t, x);
			 n.body = nest(t, x, n, Statement);
			 return n;
	 
		   case DO:
			 n = Node(t);
			 n.isLoop = true;
			 n.body = nest(t, x, n, Statement, WHILE);
			 n.condition = ParenExpression(t, x);
			 if (!x.ecmaStrictMode) {
				 // <script language="JavaScript"> (without version hints) may need
				 // automatic semicolon insertion without a newline after do-while.
				 // See http://bugzilla.mozilla.org/show_bug.cgi?id=238945.
				 t.match(SEMICOLON);
				 return n;
			 }
			 break;
	 
		   case BREAK:
		   case CONTINUE:
			 n = Node(t);
			 if (t.peekOnSameLine() == IDENTIFIER) {
				 t.get();
				 n.label = t.token().value;
			 }
			 ss = x.stmtStack;
			 i = ss.length;
			 label = n.label;
			 if (label) {
				 do {
					 if (--i < 0)
						 throw t.newSyntaxError("Label not found");
				 } while (ss[i].label != label);
			 } else {
				 do {
					 if (--i < 0) {
						 throw t.newSyntaxError("Invalid " + ((tt == BREAK)
															  ? "break"
															  : "continue"));
					 }
				 } while (!ss[i].isLoop && (tt != BREAK || ss[i].type != SWITCH));
			 }
			 n.target = ss[i];
			 break;
	 
		   case TRY:
			 n = Node(t);
			 n.tryBlock = Block(t, x);
			 n.catchClauses = [];
			 while (t.match(CATCH)) {
				 n2 = Node(t);
				 t.mustMatch(LEFT_PAREN);
				 n2.varName = t.mustMatch(IDENTIFIER).value;
				 if (t.match(IF)) {
					 if (x.ecmaStrictMode)
						 throw t.newSyntaxError("Illegal catch guard");
					 if (n.catchClauses.length && !n.catchClauses.top().guard)
						 throw t.newSyntaxError("Guarded catch after unguarded");
					 n2.guard = Expression(t, x);
				 } else {
					 n2.guard = null;
				 }
				 t.mustMatch(RIGHT_PAREN);
				 n2.block = Block(t, x);
				 n.catchClauses.push(n2);
			 }
			 if (t.match(FINALLY))
				 n.finallyBlock = Block(t, x);
			 if (!n.catchClauses.length && !n.finallyBlock)
				 throw t.newSyntaxError("Invalid try statement");
			 return n;
	 
		   case CATCH:
		   case FINALLY:
			 throw t.newSyntaxError(tokens[tt] + " without preceding try");
	 
		   case THROW:
			 n = Node(t);
			 n.exception = Expression(t, x);
			 break;
	 
		   case RETURN:
			 if (!x.inFunction)
				 throw t.newSyntaxError("Invalid return");
			 n = Node(t);
			 tt = t.peekOnSameLine();
			 // EDIT,BUG?: rather that set n.value (which already has meaning for
			 //            nodes), set n.expression
			 if (tt != END && tt != NEWLINE && tt != SEMICOLON && tt != RIGHT_CURLY)
				 n.expression = Expression(t, x);
			 break;
	 
		   case WITH:
			 n = Node(t);
			 n.object = ParenExpression(t, x);
			 n.body = nest(t, x, n, Statement);
			 return n;
	 
		   case VAR:
		   case CONST:
			 n = Variables(t, x);
			 break;
	 
		   case DEBUGGER:
			 n = Node(t);
			 break;
	 
		   case NEWLINE:
		   case SEMICOLON:
			 n = Node(t, SEMICOLON);
			 n.expression = null;
			 return n;
	 
		   default:
			 if (tt == IDENTIFIER && t.peek() == COLON) {
				 label = t.token().value;
				 ss = x.stmtStack;
				 for (i = ss.length-1; i >= 0; --i) {
					 if (ss[i].label == label)
						 throw t.newSyntaxError("Duplicate label");
				 }
				 t.get();
				 n = Node(t, LABEL);
				 n.label = label;
				 n.statement = nest(t, x, n, Statement);
				 return n;
			 }
	 
			 n = Node(t, SEMICOLON);
			 t.unget();
			 n.expression = Expression(t, x);
			 n.end = n.expression.end;
			 break;
		 }
	 
		 if (t.lineno == t.token().lineno) {
			 tt = t.peekOnSameLine();
			 if (tt != END && tt != NEWLINE && tt != SEMICOLON && tt != RIGHT_CURLY)
				 throw t.newSyntaxError("Missing ; before statement " + tokens[tt]);
		 }
		 t.match(SEMICOLON);
		 return n;
	 }
	 function TypeDefinition(t,v) {
		if (Narcissus.typeChecking && t.peek() == COLON) { // Edit: Added this for making typed variable
			t.get();
			if (t.peek() == OBJECT_ID_REFERENCE)
				t.match(OBJECT_ID_REFERENCE)
			if (t.peek() == FUNCTION) {				
				t.match(FUNCTION)
				v.varType = {value:"function"};
			}
			else if (t.peek() == MUL) {
				t.match(MUL)
				v.varType = {value:"any"};				
			}
			else {
				t.mustMatch(IDENTIFIER);
				v.varType = Node(t);
			}
		}
	 	
	 }
	 function FunctionDefinition(t, x, requireName, functionForm) {
		 var f = Node(t);
		 if (f.type != FUNCTION)
			 f.type = (f.value == "get") ? GETTER : SETTER;
		 if (t.match(IDENTIFIER))
			 f.name = t.token().value;
		 else if (requireName)
			 throw t.newSyntaxError("Missing function identifier");

	
		 t.mustMatch(LEFT_PAREN);
		 f.params = [];
		 var tt;
		 while ((tt = t.get()) != RIGHT_PAREN) {
			 if (tt != IDENTIFIER)
				 throw t.newSyntaxError("Missing formal parameter");
			var param = Node(t);
			 f.params.push(param);
			 TypeDefinition(t,param);
			 if (t.peek() != RIGHT_PAREN)
				 t.mustMatch(COMMA);
		 }
		 TypeDefinition(t,f);
		 	 	
		 t.mustMatch(LEFT_CURLY);
		 var x2 = new CompilerContext(true);
		 f.body = Script(t, x2);
		 t.mustMatch(RIGHT_CURLY);
		 f.end = t.token().end;
	 
		 f.functionForm = functionForm;
		 if (functionForm == DECLARED_FORM)
			 x.funDecls.push(f);
		 return f;
	 }
	 
	 function Variables(t, x) {
		 var n = Node(t);
		 do {
 		 	 if (!(t.match(IDENTIFIER) || t.match(COLON))) 
			 	throw t.newSyntaxError("Invalid variable initialization");
			 var n2 = Node(t);
			 TypeDefinition(t,n2);
			 n2.name = n2.value;
			 if (t.match(ASSIGN)) {
				 if (t.token().assignOp)
					 throw t.newSyntaxError("Invalid variable initialization");
				 n2.initializer = Expression(t, x, COMMA);
			 }
			 n2.readOnly = (n.type == CONST);
			 n.push(n2);
			 x.varDecls.push(n2);
		 } while (t.match(COMMA));
		 return n;
	 }
	 
	 function ParenExpression(t, x) {
		 t.mustMatch(LEFT_PAREN);
		 var n = Expression(t, x);
		 t.mustMatch(RIGHT_PAREN);
		 return n;
	 }
	 
	 // EDIT: add yielding op precedence
	 var opPrecedence = {
		 SEMICOLON: 0,
		 COMMA: 1,
		 ASSIGN: 2,
		 HOOK: 3, COLON: 3, CONDITIONAL: 3,
		 OR: 4,
		 AND: 5,
		 BITWISE_OR: 6,
		 BITWISE_XOR: 7,
		 BITWISE_AND: 8,
		 EQ: 9, NE: 9, STRICT_EQ: 9, STRICT_NE: 9,
		 LT: 10, LE: 10, GE: 10, GT: 10, IN: 10, INSTANCEOF: 10, IS: 10,
		 LSH: 11, RSH: 11, URSH: 11,
		 PLUS: 12, MINUS: 12,
		 MUL: 13, DIV: 13, MOD: 13,
		 DELETE: 14, VOID: 14, TYPEOF: 14, // PRE_INCREMENT: 14, PRE_DECREMENT: 14,
		 NOT: 14, BITWISE_NOT: 14, UNARY_PLUS: 14, UNARY_MINUS: 14,
		 INCREMENT: 15, DECREMENT: 15,     // postfix
		 NEW: 16,
		 YIELDING: 17,
		 TRANSIENT_DOT: 18,
		 DOT: 18,OBJECT_ID_REFERENCE: 19
	 };
	 
	 // Map operator type code to precedence.
	 // EDIT: slurp opPrecence items into array first, because IE includes
	 //       modified hash items in iterator when modified during iteration
	 var opPrecedenceItems = [];
	 for (i in opPrecedence) 
		opPrecedenceItems.push(i);
	 
	 for (var i = 0; i < opPrecedenceItems.length; i++) {
		var item = opPrecedenceItems[i];
		opPrecedence[eval(item)] = opPrecedence[item];
	 }
	
	 var opArity = {
		 COMMA: -2,
		 ASSIGN: 2,
		 CONDITIONAL: 3,
		 OR: 2,
		 AND: 2,
		 BITWISE_OR: 2,
		 BITWISE_XOR: 2,
		 BITWISE_AND: 2,
		 EQ: 2, NE: 2, STRICT_EQ: 2, STRICT_NE: 2,
		 LT: 2, LE: 2, GE: 2, GT: 2, IN: 2, INSTANCEOF: 2, IS: 2,
		 LSH: 2, RSH: 2, URSH: 2,
		 PLUS: 2, MINUS: 2,
		 MUL: 2, DIV: 2, MOD: 2,
		 DELETE: 1, VOID: 1, TYPEOF: 1,  OBJECT_ID_REFERENCE: 1,// PRE_INCREMENT: 1, PRE_DECREMENT: 1,
		 NOT: 1, BITWISE_NOT: 1, UNARY_PLUS: 1, UNARY_MINUS: 1,
		 INCREMENT: 1, DECREMENT: 1,     // postfix
		 NEW: 1, NEW_WITH_ARGS: 2, DOT: 2, TRANSIENT_DOT: 2, INDEX: 2, TRANSIENT_INDEX: 2, CALL: 2, YIELDING: 3,
		 ARRAY_INIT: 1, OBJECT_INIT: 1, GROUP: 1
	 };
	 
	 // Map operator type code to arity.
	 // EDIT: same as above
	 var opArityItems = [];
	 for (i in opArity)
		opArityItems.push(i);
	 
	 for (var i = 0; i < opArityItems.length; i++) {
		var item = opArityItems[i];
		opArity[eval(item)] = opArity[item];
	 }
	 
	 function Expression(t, x, stop) {
		 var n, id, tt, operators = [], operands = [];
		 var bl = x.bracketLevel, cl = x.curlyLevel, pl = x.parenLevel,
			 hl = x.hookLevel;
	 
		 function reduce() {
			 var n = operators.pop();
			 var op = n.type;
			 var arity = opArity[op];
			 if (arity == -2) {
				 // Flatten left-associative trees.
				 var left = operands.length >= 2 && operands[operands.length-2];
				 if (left.type == op) {
					 var right = operands.pop();
					 left.push(right);
					 return left;
				 }
				 arity = 2;
			 }
	 
			 // Always use push to add operands to n, to update start and end.
			 // EDIT: provide second argument to splice or IE won't work.
			 var index = operands.length - arity;
			 var a = operands.splice(index, operands.length - index);
			 for (var i = 0; i < arity; i++)
				 n.push(a[i]);
	 
			 // Include closing bracket or postfix operator in [start,end).
			 if (n.end < t.token().end)
				 n.end = t.token().end;

			 operands.push(n);
			 return n;
		 }
	 
	 loop:
		 while ((tt = t.get()) != END) {
			 if (tt == stop &&
				 x.bracketLevel == bl && x.curlyLevel == cl && x.parenLevel == pl &&
				 x.hookLevel == hl) {
				 // Stop only if tt matches the optional stop parameter, and that
				 // token is not quoted by some kind of bracket.
				 break;
			 }
			 switch (tt) {
			   case SEMICOLON:
				 // NB: cannot be empty, Statement handled that.
				 break loop;
	 
			   case ASSIGN:
			   case HOOK:
			   case COLON:
				 if (t.scanOperand)
					 break loop;
				 // Use >, not >=, for right-associative ASSIGN and HOOK/COLON.
				 while (opPrecedence[operators.top().type] > opPrecedence[tt])
					 reduce();
				 if (tt == COLON) {
					 n = operators.top();
					 if (n.type != HOOK)
						 throw t.newSyntaxError("Invalid label");
					 n.type = CONDITIONAL;
					 --x.hookLevel;
				 } else {
					 operators.push(Node(t));
					 if (tt == ASSIGN)
						 operands.top().assignOp = t.token().assignOp;
					 else
						 ++x.hookLevel;      // tt == HOOK
				 }
				 t.scanOperand = true;
				 break;
	 
			   case IN:
				 // An in operator should not be parsed if we're parsing the head of
				 // a for (...) loop, unless it is in the then part of a conditional
				 // expression, or parenthesized somehow.
				 if (x.inForLoopInit && !x.hookLevel &&
					 !x.bracketLevel && !x.curlyLevel && !x.parenLevel) {
					 break loop;
				 }
				 // FALL THROUGH
			   case COMMA:
				 // Treat comma as left-associative so reduce can fold left-heavy
				 // COMMA trees into a single array.
				 // FALL THROUGH
			   case OR:
			   case AND:
			   case BITWISE_OR:
			   case BITWISE_XOR:
			   case BITWISE_AND:
			   case EQ: case NE: case STRICT_EQ: case STRICT_NE:
			   case LT: case LE: case GE: case GT:
			   case INSTANCEOF: case IS:
			   case LSH: case RSH: case URSH:
			   case PLUS: case MINUS:
			   case MUL: case DIV: case MOD:
			   case DOT: case TRANSIENT_DOT:
				 if (t.scanOperand)
					 break loop;
				 while (opPrecedence[operators.top().type] >= opPrecedence[tt])
					 reduce();
				 if (tt == DOT) {
					 t.mustMatch(IDENTIFIER);
					 operands.push(Node(t, DOT, operands.pop(), Node(t)));
				 } else if (tt == TRANSIENT_DOT) {
					 t.mustMatch(IDENTIFIER);
					 operands.push(Node(t, TRANSIENT_DOT, operands.pop(), Node(t)));
				 } else {
					 operators.push(Node(t));
					 t.scanOperand = true;
				 }
				 break;
	 
			   case DELETE: case VOID: case TYPEOF:
			   case NOT: case BITWISE_NOT: case UNARY_PLUS: case UNARY_MINUS: case OBJECT_ID_REFERENCE:
			   case NEW:
				 if (!t.scanOperand)
					 break loop;
				 operators.push(Node(t));
				 break;
	 
			   case INCREMENT: case DECREMENT:
				 if (t.scanOperand) {
					 operators.push(Node(t));  // prefix increment or decrement
				 } else {
					 // Use >, not >=, so postfix has higher precedence than prefix.
					 while (opPrecedence[operators.top().type] > opPrecedence[tt])
						 reduce();
					 n = Node(t, tt, operands.pop());
					 n.postfix = true;
					 operands.push(n);
				 }
				 break;
	 
			   case FUNCTION:
				 if (!t.scanOperand)
					 break loop;
				 operands.push(FunctionDefinition(t, x, false, EXPRESSED_FORM));
				 t.scanOperand = false;
				 break;
	 
			   case NULL: case THIS: case TRUE: case FALSE:
			   case IDENTIFIER: case NUMBER: case STRING: case REGEXP:
				 if (!t.scanOperand)
					 break loop;
				 operands.push(Node(t));
				 t.scanOperand = false;
				 break;
	 
			   case LEFT_BRACKET:
				 if (t.scanOperand) {
					 // Array initialiser.  Parse using recursive descent, as the
					 // sub-grammar here is not an operator grammar.
					 n = Node(t, ARRAY_INIT);
					 while ((tt = t.peek()) != RIGHT_BRACKET) {
						 if (tt == COMMA) {
							 t.get();
							 n.push(null);
							 continue;
						 }
						 n.push(Expression(t, x, COMMA));
						 if (!t.match(COMMA))
							 break;
					 }
					 t.mustMatch(RIGHT_BRACKET);
					 operands.push(n);
					 t.scanOperand = false;
				 } else {
					 // Property indexing operator.
					 operators.push(Node(t, INDEX));
					 t.scanOperand = true;
					 ++x.bracketLevel;
				 }
				 break;
	 		   case TRANSIENT_LEFT_BRACKET:
				 // Property indexing operator.
				 operators.push(new Node(t, TRANSIENT_INDEX));
				 t.scanOperand = true;
				 ++x.bracketLevel;
				 break;	 		   
			   case RIGHT_BRACKET:
				 if (t.scanOperand || x.bracketLevel == bl)
					 break loop;
				 do {
				 	var type = reduce().type;
				 }
				 while (type != INDEX && type != TRANSIENT_INDEX)
				 --x.bracketLevel;
				 break;
	 
			   case LEFT_CURLY:
				 if (!t.scanOperand)
					 break loop;
				 // Object initialiser.  As for array initialisers (see above),
				 // parse using recursive descent.
				 ++x.curlyLevel;
				 n = Node(t, OBJECT_INIT);
			   object_init:
				 if (!t.match(RIGHT_CURLY)) {
					 do {
						 tt = t.get();
						 if ((t.token().value == "get" || t.token().value == "set") &&
							 t.peek() == IDENTIFIER) {
							 if (x.ecmaStrictMode)
								 throw t.newSyntaxError("Illegal property accessor");
							 n.push(FunctionDefinition(t, x, true, EXPRESSED_FORM));
						 } else {
							 switch (tt) {
							   case IDENTIFIER:
							   case NUMBER:
							   case STRING:
								 id = Node(t);
								 break;
							   case RIGHT_CURLY:
								 if (x.ecmaStrictMode)
									 throw t.newSyntaxError("Illegal trailing ,");
								 break object_init;
							   default:
								 throw t.newSyntaxError("Invalid property name");
							 }
							 t.mustMatch(COLON);
							 n.push(Node(t, PROPERTY_INIT, id,
											 Expression(t, x, COMMA)));
						 }
					 } while (t.match(COMMA));
					 t.mustMatch(RIGHT_CURLY);
				 }
				 operands.push(n);
				 t.scanOperand = false;
				 --x.curlyLevel;
				 break;
	 
			   case RIGHT_CURLY:
				 if (!t.scanOperand && x.curlyLevel != cl)
					 throw "PANIC: right curly botch";
				 break loop;
	 
			   case YIELDING:
				 while (opPrecedence[operators.top().type] > opPrecedence[YIELDING])
					 reduce();
				 t.mustMatch(LEFT_PAREN);
				 var yielding = true;
				 // FALL THROUGH
				 
			   case LEFT_PAREN:
				 if (t.scanOperand) {
					 operators.push(Node(t, GROUP));
				 } else {
					 while (opPrecedence[operators.top().type] > opPrecedence[NEW])
						 reduce();
	 
					 // Handle () now, to regularize the n-ary case for n > 0.
					 // We must set scanOperand in case there are arguments and
					 // the first one is a regexp or unary+/-.
					 n = operators.top();
					 t.scanOperand = true;
					 if (t.match(RIGHT_PAREN)) {
						 if (n.type == NEW) {
						 	n.type = NEW_WITH_ARGS;
							 --operators.length;
							 n.push(operands.pop());
						 } else {
							 n = Node(t, CALL, operands.pop(),
										  Node(t, LIST));
						 }
						 operands.push(n);
						 t.scanOperand = false;
						 n.yielding = yielding || false;
						 break;
					 }
					 if (n.type == NEW) {
						 n.type = NEW_WITH_ARGS;
					 } else {
						 n = Node(t, CALL);
						 operators.push(n);
					 }
					 n.yielding = yielding || false;
				 }
				 ++x.parenLevel;
				 break;
	 
			   case RIGHT_PAREN:
				 if (t.scanOperand || x.parenLevel == pl)
					 break loop;
				 while ((tt = reduce().type) != GROUP && tt != CALL &&
						tt != NEW_WITH_ARGS) {
					 continue;
				 }
				 if (tt != GROUP) {
					 n = operands.top();
					 if (n[1].type != COMMA)
						 n[1] = Node(t, LIST, n[1]);
					 else
						 n[1].type = LIST;
				 }
				 --x.parenLevel;
				 break;
	 
			   // Automatic semicolon insertion means we may scan across a newline
			   // and into the beginning of another statement.  If so, break out of
			   // the while loop and let the t.scanOperand logic handle errors.
			   default:
				 break loop;
			 }
		 }
	 
		 if (x.hookLevel != hl)
			 throw t.newSyntaxError("Missing : after ?");
		 if (t.scanOperand)
			 throw t.newSyntaxError("Missing operand");
	 
		 // Resume default mode, scanning for operands, not operators.
		 t.scanOperand = true;
		 t.unget();
		 while (operators.length)
			 reduce();
		 return operands.pop();
	 }
	 
	 function parse(s, f, l) {
		 var t = new Tokenizer(s, f, l);
		 var x = new CompilerContext(false);
		 var n = Script(t, x);
		 if (!t.done())
			 throw t.newSyntaxError("Syntax error");
		 return n;
	 }
	 
	 // make stuff visible to StrandsCompiler
	 this.parse      = parse;
	 this.Node       = Node;
	 this.tokens     = tokens;
	 this.consts     = consts;
	 
}).call(Narcissus);
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narrative JavaScript compiler.
 *
 * The Initial Developer of the Original Code is
 * Neil Mix (neilmix -at- gmail -dot- com).
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

NJS_CODE = Narcissus.REGEXP; // fake node type for strands code segment

// declare it this way so that when it is evaled it gets put in the global scope
StrandsCompiler = function (options) {
	this.nodeSequence = 0;
	this.options = options || {};
	this.parseBooleanOptions("exceptions", true);
	this.parseBooleanOptions("defaultYield", true);
}

var strandscp = StrandsCompiler.prototype;

strandscp.parseBooleanOptions = function (/*...*/) {
	var options = this.options;
	for (var i = 0; i < arguments.length; i += 2) {
		var name = arguments[i];
		var value = options[name];
		if (value == null) {
			options[name] = arguments[i+1];
		} else {
			if (typeof(value) == "string")
				value = value.toLowerCase();
	
			options[name] = value == "yes" || value == "true" || value == "on" || value == "1";
		}
	}
}

strandscp.compile = function (/*string*/ code, /*string*/ scriptName,thisObject,scopeObject) {
	if (!_frm)
		var frame = {_cp:0};
	else
		var frame = _frm(this,arguments,[],[]);
	if (!frame._cp) {
		Narcissus.typeChecking = this.options.typeChecking;
		frame.n = Narcissus.parse(code, scriptName, 1); 
		this.treeify(frame.n);
		var resolver = frame.resolver = new StrandsScopeResolver();
		resolver.push(frame.n, false);
		resolver.globalChecking = !(!thisObject);
		resolver.thisObject = thisObject;
		resolver.scopeObject = scopeObject || {};
		frame._cp = 1;	
	}
	if (_frm) {
		try {
			var errors = strandscp.currentError = {};
			frame.n = this.assemble(frame.n, frame.resolver, this.options);
		} catch (e) {
			if (strands && e == strands.Suspension) // this is a continuation escape, suspend so we can try again later
				return frame._s();
			throw e; // this is a real error
		}
	}
	else {
		var errors = strandscp.currentError = {};
		frame.n = this.assemble(frame.n, frame.resolver, this.options);
	}
	if (errors.next)
		throw errors.next;
	var writer = new StrandsScriptWriter();
	if (writer.debug = this.options.debug)
		writer.sourceLines = code.split('\n');
	writer.add(frame.n);
	return writer.toString();
}

strandscp.treeify = function(n) {
	if (n.type == Narcissus.SWITCH) {
		// hack.  *sigh*  n.cases is an array, not a Node.  So we have
		// to fool our treeification process into thinking this node
		// has Node children.
		for (var i = 0; i < n.cases.length; i++) {
			n[i] = n.cases[i];
		}
		n.length = n.cases.length;
	}
	
	if (n.type == Narcissus.TRY) {
		// another hack.  catchClauses is a regular array.
		for (var i = 0; i < n.catchClauses.length; i++) {
			n["catch" + i] = n.catchClauses[i];
		}
	}
	
	// for-in constructs will use the identifier node within its varDecl
	// as the iterator value, which means it may get operated on twice
	// during the treeification process.
	if( n.treeified )
		return;

	n.treeified = true;
	if (this.options.defaultYield && (n.type==Narcissus.CALL || n.type==Narcissus.NEW || n.type==Narcissus.NEW_WITH_ARGS || n.type==Narcissus.INDEX || n.type==Narcissus.DOT))
		n.yielding = !n.yielding;
	for (var i in n) {
		if (n[i] != null &&
		    typeof(n[i]) == 'object' &&
		    n[i].constructor == Narcissus.Node &&
			i != "target" &&
			i != "parent") 
		{
			var child = n[i];

			// set this before treeification so that our parent is available
			// in the post-treeification below.
			child.parent = n;

			this.treeify(child);
			
			if(child.yielding && child.type != Narcissus.FUNCTION)
				n.yielding = true;
		}
	}

	if (n.type == Narcissus.TRY) {
		n = n.parent;
		while (n != null && n.type != Narcissus.FUNCTION)
			n = n.parent;
		
		if (n != null)
			n.hasTry = true;
	}
}

strandscp.noderize = function(opts) {
	var n = new Array();
	n.nodeID = this.nodeSequence++;
	n.toString = Narcissus.Node.prototype.toString;
	if (opts) {
		for (var i in opts) {
			n[i] = opts[i];
		}
	}
	n.isNode = true;
	return n;
}

strandscp.assemble = function(root, scopeResolver, options) {
	function ObjectType(object,field) {		
		this.object = object;
		this.field = field;
	}
	ObjectType.prototype = {
		getValue : function() {
			if (this.value)
				return this.value;
			else if (this.object && this.field)
				exceptingGet(this.object,this.field);
		},
		getType : function() {
			if (this.object && this.field)
				return exceptingGet(exceptingGet(this.object,"structure"), this.field);
		}
	}
	// make consts names available to execute()
	eval(Narcissus.consts);
	// declare these locally so they can be used within closures
	var noderize = StrandsCompiler.prototype.noderize; 
	var assemble = StrandsCompiler.prototype.assemble;
	
	var codePtrSequence = 0;
	var executed = [];
	
	var stack = [];
	var exPtrStack = [];
		
	var statements = [];
	while (root.length) {
		tailFrame = null;
		statements.push(execute(root.shift()));
	}

	for( var i = 0; i < statements.length; i++ ) {
		if (statements[i])
			root.push(statements[i]);
	}
	var lineno;
	return root;
	
	function execute(node) {
		if (node == null)
			return null;

		stack.push(node);
		lineno = node.lineno;
		switch(node.type) {
		  case SCRIPT:
			throw new Error("what's a script doing in a statement?");

		  case FUNCTION:
		  	if (scopeResolver.isYielding() && node.name) {
		  		node.scoped = true;
		  		node.name = scopeResolver.addSymbol(node.name,FUNCTION_TYPE);				
		  	}
			if (isYielding(node.body)) {
				scopeResolver.push(node.body, true);
				var vars = '';
				var scopedVars = scopeResolver.scopes[scopeResolver.scopes.length-1];
				for (var i in scopedVars) {
					vars += ',"' + i + '"';
				}
				vars = vars.substring(1);
				var params = '';
				for (var i = 0; i < node.params.length; i++) {
					params += ',"' + node.params[i].value + '"';
					scopeResolver.addSymbol(node.params[i].value,node.params[i].varType||ANY_TYPE);
				}
				params = params.substring(1);
				var openNodes = [
					codeNode('var _scope=_frm(this,arguments,[~],[~]);with(_scope){', // we could make it more compact in non debug mode with: codeNode(options.debug?'var _scope=_frm(this,arguments,[~],[~]);with(_scope){':'with(_frm(this,arguments,[~],[~])){',
				             params,vars),
				    codeNode('while(1){'),
				    (!options.exceptions ?
						codeNode("$_noex=1;") :
				        node.hasTry ?
				          codeNode('try{') :
				          codeNode('')),
				    codeNode('switch(_cp){case 0:')
				];

				while (openNodes.length)
					node.body.unshift(openNodes.pop());

				node.body.push(codeNode('return;' + (options.persistent?'case -1:return _s()}':'}')));
				if (options.exceptions && node.hasTry)
					node.body.push(codeNode("}catch(ex){_s(ex)}"));
				node.body.push(codeNode("}}"));

				assemble(node.body, scopeResolver, options);
				node.params = []; // get rid of the parameters so that the JS compression doesn't eliminate them.
				scopeResolver.pop();
			} else {
				for (var i = 0; i < node.params.length; i++)  {
					scopeResolver.addSymbol(node.params[i].value,node.params[i].varType||ANY_TYPE);
					node.params[i] = node.params[i].value;
				}
				
				scopeResolver.push(node.body, false);
				assemble(node.body, scopeResolver, options);
				scopeResolver.pop();
			}
			break;
  		  case ASSIGN: case DELETE:
	  		var propName = node[0].value;
		  	if (options.persistence && node[0].type == DOT && withinYielding(node)) {
		  		if (node.type == DELETE)
		  			node[1] = noderize({
			  					type: LIST,
					  			0: node[0][0],
			  					1: codeNode('"' + propName + '"')});
		  		else {
			  		node[1] = noderize({
			  			type: LIST,
			  			0: node[0][0],
			  			1: codeNode('"' + propName + '"'),
			  			2: node[1]});
		  		}
		  		node.type=CALL;
		  		node[0] = codeNode("_p");
		  	}
		  	else 	if (options.persistence && node[0].type == INDEX && withinYielding(node)) {
		  		var index = node[0][1];
		  		if (node.type == DELETE)
		  			node[1] = noderize({
			  					type: LIST,
					  			0: node[0][0],
			  					1: index});
		  		else {
			  		node[1] = noderize({
			  			type: LIST,
			  			0: node[0][0],
			  			1: index,
			  			2: node[1]});
				  	}
		  		node.type=CALL;
		  		node[0] = codeNode("_p");
		  	}
		  	else {
				for (var i = 0; i < node.length; i++) {
					node[i] = execute(node[i]);
				}
				if (node.type != DELETE)
			  		typeCheck(node[0],node[1]);
				break;
		  	}
		  	// fall through
		  case NEW: case NEW_WITH_ARGS: case CALL:
			// If it is persistent, we can go right to the transients on function calls
			if (node[0].type == TRANSIENT_DOT)
				node[0].type	 = DOT;
			if (node[0].type == TRANSIENT_INDEX) 
				node[0].type = INDEX;
			
			// execute our identifier and args *first*
			node[0] = execute(node[0]);
			if (node[0].value == "spawn" && node[0].type == IDENTIFIER) {
				node[1].yielding = false;
				break;
			}
			var varType;
			if (node.type == NEW)
				varType = node[0].varType;
			if (!isYielding(node) || !withinYielding(node))
				break;
			if (node[1]) {// new (without args) doesn't have a list
				if (node.type == NEW_WITH_ARGS)
					node[1].type = ARRAY_INIT;
				var newArgs = execute(node[1]);
			}
			
			codePtrSequence++;
			
			// update our code pointer
			addCode("_cp=~;",
					codePtrSequence);

			// set up our re-entry point
			newCodeSegment(codePtrSequence);
			if (node.type!=CALL) { // This is the persistent JavaScript extension to do news on objects
				node = noderize({type: CALL,
											yielding: true,
											0 : codeNode("_new"),
											1 : noderize({type: LIST,
																  0:node[0]})
				});
				if (newArgs)
					node[1][1] = newArgs;
			}							 
			// remove the call node from the stack,
			// replace it with rv if necessary
			if (stack.length > 1 && stack[stack.length-2].type == SEMICOLON) {
				// simple semicolon expression.  don't bother
				// with retval -- there aren't any dependencies
				replaceNode(null);
			} else {
				var newNode = codeNode("_r.v~", 
									 codePtrSequence);
				newNode.varType = varType;
				replaceNode(newNode);
			}
			
			var checkRetNode = noderize({
				type: IF,
				condition: noderize({
					type: STRICT_EQ,
					0: noderize({
						type: GROUP,
						0: noderize({
							type: ASSIGN,
							0: codeNode("_r.v~",
										codePtrSequence),
							1: node
						})
					}),
					1: codeNode("_S")
				}),
				thenPart: noderize({
					type: SEMICOLON,
					expression: codeNode("return _s()")
				})
			});
			
			// add our call as a statement at the top level
			statements.push(checkRetNode);
			
			break;

 		  case IF:
 		  	node.condition = execute(node.condition);
			if (isYielding(node.thenPart) ||
				(node.elsePart && isYielding(node.elsePart)))
			{				
				var thenPtr = ++codePtrSequence;
				if (node.elsePart)
					var elsePtr = ++codePtrSequence;
				var endPtr = ++codePtrSequence;
				newConditional(node.condition, thenPtr, elsePtr || endPtr);
				newCodeSegment(thenPtr);
				
				// thenPart
				execBlock(node.thenPart);
				gotoCodeSegment(endPtr);

				// elsePart
				if (node.elsePart) {
					newCodeSegment(elsePtr);
					execBlock(node.elsePart);
					gotoCodeSegment(endPtr);
				}
				
				// end if
				newCodeSegment(endPtr);

				replaceNode(null);
			} else {
				// make sure we catch any breaks or continues
				node.thenPart = execute(node.thenPart);
				if (node.elsePart)
					node.elsePart = execute(node.elsePart);
			}
			break;

  		  case FOR_IN: // varDecl/iterator, object, body
			if (node.varDecl == null) {
				node.iterator = execute(node.iterator);
			} else {
				node.varDecl = execute(node.varDecl);
			}
			node.object = execute(node.object);
			
/*			if (!isYielding(node.body)) { // we will always do it so they we can weed out dont-enums.
				node.body = execute(node.body);
				break;
			}*/
			
			// grab all items from the object and stick them in a local array
			var iterId = codePtrSequence;
			statements.push(noderize({
				type: NJS_CODE, 
				value: subst("_r.iter~=_keys(", iterId),
				lineno: node.object.lineno
			}));
			statements.push(node.object);
			addCode(");");

			// change the FOR_IN into a regular FOR
			node.type = FOR;
			node.setup = codeNode("_r.ctr~=0;", iterId);
			node.condition = codeNode("_r.ctr~<_r.iter~.length",
				                      iterId, iterId);
			node.update = codeNode("_r.ctr~++", iterId);
			var initializer = codeNode("_r.iter~[_r.ctr~]",
				                        iterId, iterId);
			 // make sure our body is a block so we can add a statement to it
			if (node.body.type != BLOCK)
				node.body = noderize({type: BLOCK, yielding: true, 0: node.body});

			if (node.varDecl == null) {
				// iterator -- create an assignment
				var assign = noderize({type: ASSIGN});
				assign.push(node.iterator);
				assign.push(initializer);
				node.body.unshift(noderize({type: SEMICOLON, expression: assign}));
			} else {
				// varDecl -- use the initializer
				node.varDecl[0].initializer = initializer;
				node.body.unshift(node.varDecl);
			}
			node.iterator = null;
			node.varDecl = null;
			// FALL THROUGH
			
		  case FOR:
			node.setup = execute(node.setup);
			if (!isYielding(node.body) && !isYielding(node.update))  {
				node.condition = execute(node.condition);
				node.update    = execute(node.update);
				node.body      = execute(node.body);
				break;
			}
			
			// turn it into a WHILE statement
			node.type = WHILE;
			
			// move the setup before the while
			if(node.setup.type != VAR  && node.setup.type != NJS_CODE)
				node.setup = noderize({type: SEMICOLON, expression: node.setup});

			statements.push(node.setup);
			node.setup = null;

			// make sure our body is a block so we can add a statement to it
			if (node.body.type != BLOCK)
				node.body = noderize({type: BLOCK, 0: node.body});

			node.updatePtr = ++codePtrSequence;
			node.body.push(newCodeSegmentNode(node.updatePtr));
			
			// make sure the proper update happens in the block
			node.body.push(noderize({type: SEMICOLON, expression: node.update}));
			node.update = null; 		  		

			// FALL THROUGH

 		  case WHILE:
 		  	if (isYielding(node)) {
 		  		node.continuePtr = ++codePtrSequence;
 		  		newCodeSegment(node.continuePtr);
 		  		node.condition = execute(node.condition);

 		  		var bodyPtr  = ++codePtrSequence;
 		  		node.breakPtr = ++codePtrSequence;
 		  		newConditional(node.condition, bodyPtr, node.breakPtr);
 		  		newCodeSegment(bodyPtr);
 		  		execBlock(node.body);
 		  		gotoCodeSegment(node.continuePtr);
 		  		newCodeSegment(node.breakPtr);

				replaceNode(null);
 		  	} else {
 		  		node.condition = execute(node.condition);
 		  		node.body = execute(node.body);
 		  	}
 		  	break;
 		  
 		  case DO:
 		  	if (isYielding(node)) {
 		  		node.continuePtr = ++codePtrSequence;
				node.breakPtr = ++codePtrSequence;
 		  		newCodeSegment(node.continuePtr);
 		  		execBlock(node.body);

 		  		newConditional(execute(node.condition), node.continuePtr, node.breakPtr);
 		  		newCodeSegment(node.breakPtr);

 		  		replaceNode(null);
 		  	} else {
 		  		node.condition = execute(node.condition);
 		  		node.body = execute(node.body);
 		  	}
 		    break;
		  
		  case BREAK:
			if (node.target.breakPtr != null) {
				replaceNode(codeNode("_cp=~;break;", 
					                 node.target.breakPtr));
			}
			break;
		  	
		  case CONTINUE:
			if (node.target.continuePtr != null) {
				replaceNode(codeNode("_cp=~;break;", 
					                 node.target.updatePtr || node.target.continuePtr));
			}
			break;
		  
		  case SWITCH:
			if (!isYielding(node))
				break;
			
			node.breakPtr = ++codePtrSequence;
			var conditional = null;
			if (node.defaultIndex >= 0) {
				node[node.defaultIndex].codePtr = ++codePtrSequence;
				conditional = codeNode(node[node.defaultIndex].codePtr);
			} else {
				conditional = codeNode(node.breakPtr);
			}
			
			for (var i = node.length - 1; i >= 0; i--) {
				if (i == node.defaultIndex)
					continue;
				
				// adjust the line numbering of the case label nodes
				removeLineNumbers(node[i].caseLabel);
				
				node[i].codePtr = ++codePtrSequence;
				conditional = noderize({
					type: CONDITIONAL,
					0: noderize({
						type: EQ,
						0: node.discriminant,
						1: node[i].caseLabel
					}),
					1: codeNode(node[i].codePtr),
					2: conditional
				});
			}
			
			statements.push(noderize({
				type: SEMICOLON,
				expression: noderize({
					type: ASSIGN,
					0: codeNode("_cp"),
					1: execute(conditional)
				})
			}));
			statements.push(codeNode("break;"));
			
			for (var i = 0; i < node.length; i++) {
				newCodeSegment(node[i].codePtr);
				execBlock(node[i].statements);
			}
			
			newCodeSegment(node.breakPtr);
			
			replaceNode(null);
			break;
			
		  case WITH:
		    if (isYielding(node)) {
		  		//throw new Error("yielding within " + Narcissus.tokens[node.type].toUpperCase() + " not supported");
		    	var oldStatements = statements;
		    	var innerStatements = statements = [];	    	
		    	node.body.unshift(codeNode('switch(_cp){case ~:',codePtrSequence));
		    	var body = execute(node.body);
		    	for (var i = 0; i < body.length; i++)
		    		if (!body[i]) {
		    			body.splice(i--,1);
		    		}
		    	statements = oldStatements;
		    	
	    		for( var i = 0; i < innerStatements.length; i++ ) {
					if (innerStatements[i]) {
						if (innerStatements[i].codeSegmentId)
							newCodeSegment(innerStatements[i].codeSegmentId);							
						node.body.push(innerStatements[i]);
					}
				}
		    	codePtrSequence++;
		    	node.body.push(codeNode('_cp=~}break;',codePtrSequence));
		    	statements.push(node);
		    	replaceNode(null);
		    	newCodeSegment(codePtrSequence);
		    }
			break;

		  case TRY:
		 	if (!isYielding(node))
		 		break;
		 	
		 	if (!options.exceptions)
		 		throw new Error("yielding within try/catch/finally not allowed when the exceptions are turned off in the compiler");

			//   set codeptr for catches, finally, endptr
			for (var i = 0; i < node.catchClauses.length; i++) {
				node.catchClauses[i].codePtr = ++codePtrSequence;
			}
			
			if (node.finallyBlock)
				node.finallyBlock.codePtr = ++codePtrSequence;

			var endPtr = ++codePtrSequence;
			
			// set exception codePtr
			var exCodePtr = node.catchClauses.length ?
			                node.catchClauses[0].codePtr :
			                node.finallyBlock.codePtr;
			
			addCode("_r.ecp=~;", exCodePtr);
			exPtrStack.push(exCodePtr);
			execBlock(node.tryBlock);
			node.finallyBlock ? gotoCodeSegment(node.finallyBlock.codePtr) :
			                    gotoCodeSegment(endPtr);
			exPtrStack.pop();

			for (var i = 0; i < node.catchClauses.length; i++) {
				var clause = node.catchClauses[i];
				newCodeSegment(clause.codePtr);

				if (i == 0) {
					// first catch block
					// set exception codePtr appropriately
					addCode("_r.ecp=~;", 
						                node.finallyBlock ? 
						                node.finallyBlock.codePtr :
						                (exPtrStack.top() || "null"));
					// reset throwing flag to prevent infinite loopage
					addCode("$_thr=false;");
				}

				// set our exception var.  This will override any masked
				// variables with the same name.  Technically this is
				// incorrect behavior.  I should fix this, but I'm too 
				// lazy right now.
				scopeResolver.addSymbol(clause.varName,ANY_TYPE)
				addCode("~ = $_ex;", scopeResolver.getSymbol(clause.varName));

				if (clause.guard) {
					clause.guard = execute(clause.guard);
					statements.push(noderize({
						type: NJS_CODE,
						value: "if(!(",
						lineno: clause.guard.lineno
					}));
					statements.push(clause.guard);
					addCode(")) {");

					// handle missed guard clause carefully						
					if (i < node.catchClauses.length - 1) {
						gotoCodeSegment(node.catchClauses[i+1].codePtr);
					} else if (node.finallyBlock) {
						gotoCodeSegment(node.finallyBlock.codePtr);
					} else if (exPtrStack.length) {
						gotoCodeSegment(exPtrStack.top());
					} else {
						addCode("throw ~;", scopeResolver.getSymbol(clause.varName));
					}
					
					addCode("}");
				}
			
				if (node.finallyBlock)
					exPtrStack.push(node.finallyBlock.codePtr);
				execBlock(clause.block);
				if (node.finallyBlock)
					exPtrStack.pop();
				
				// handle successful execution of catch clause
				if (node.finallyBlock) {
					gotoCodeSegment(node.finallyBlock.codePtr);
				} else {
					gotoCodeSegment(endPtr);
				}
			}
			
			if (node.finallyBlock) {
				newCodeSegment(node.finallyBlock.codePtr);

				// set the exception code pointer
				addCode("_r.ecp=~;", 
								    exPtrStack.top() || "null");

				execBlock(node.finallyBlock);

				// if we're throwing, rethrow, otherwise goto endPtr
				addCode("if($_thr){");
				if (exPtrStack.length) {
					gotoCodeSegment(exPtrStack.top());
				} else {
					addCode("$_except($_ex);return;");
				}
				addCode("}else{");
				gotoCodeSegment(endPtr);
				addCode("}");
			}

			newCodeSegment(endPtr);
			
			replaceNode(null);
			break;
		  case TRUE: case FALSE: node.varType = "Boolean"; break;
		  case NUMBER: 
		  	node.varType = "Number"; 
		  break;
		  case STRING: 
		  	node.varType = "String";
		  	break;
			
		  case THIS: 
  		  	node.varType = new ObjectType();
  		  	node.varType.value = scopeResolver.thisObject;
  		  	node.varType.type = scopeResolver.thisObject;
		  case DEBUGGER: case LABEL: case NULL:
		  case REGEXP: case NJS_CODE:
			// nothing to do
			break;
		
		  case IDENTIFIER:
			node.value = scopeResolver.getSymbol(node.value);
		    node.initializer = execute(node.initializer);
		    if (node.initializer)
			    typeCheck(node,node.initializer);
		  	break;
			
		  case THROW:
			node.exception = execute(node.exception);
			break;
 
		  case RETURN:
		  case SEMICOLON:
			node.expression = execute(node.expression);
			break;
		  
		  case OR: case AND:
		  	// because of the "guarding" nature of boolean comparisons, we need to
		  	// pull out comparisons with right-side yields into their own
		  	// statements and transform them separately.
		  	var left = node[0];
		  	var right = node[1];
		  	
		  	node[0] = left = execute(left);
		  	if (!isYielding(right)) {
		  		node[1] = execute(right);
		  		break;
		  	}

			var condVar = "_c" + codePtrSequence;
			
			// put the left in it's own assign statement
			statements.push(noderize({
				type: SEMICOLON,
				expression: noderize({
					type: ASSIGN,
					0: codeNode("var ~", condVar),
					1: left
				})
			}));
			
			// create a boolean node that indicates whether or not the left guards
			// against execution of the right
			var cond = codeNode(condVar);
			if (node.type == OR) {
				cond = noderize({
					type: NOT,
					value: "!",
					0: cond
				});
			}
			
			// create an if node that checks the guarded value and executes
			// the right if appropriate
			var guard = noderize({
				type: IF,
				condition: cond,
				thenPart: noderize({
					type: SEMICOLON,
					expression: noderize({
						type: ASSIGN,
						0: codeNode(condVar),
						1: right,
						yielding: true
					}),
					parent: node,
					yielding: true
				}),
				yielding: true
			});
			// execute the if node as if it were top-level
			var tmpStack = stack;
			stack = [];
			statements.push(execute(guard));
			stack = tmpStack;
			
			// finally, hand back the result of the guarding process
			node.type = NJS_CODE;
			node.value = condVar;
		  	break;
		  case VAR:
		  	if(scopeResolver.isYielding())
		  		node.scoped = true;
  			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]);
			}
			break;
		  

		  case EQ: case NE: case STRICT_EQ: case STRICT_NE:
		  case LT: case LE: case GE: case GT:
		  case TYPEOF: case NOT: case INSTANCEOF:
		  	node.varType = "Boolean";
  			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]);
			}
			break;
		  case UNARY_PLUS: case UNARY_MINUS: case INCREMENT: case DECREMENT:
		  case LSH: case RSH: case URSH:
		  case MINUS: case MUL: case DIV: case MOD:
		  	node.varType = "Number";
  			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]); // should do a type check here
			}
			break;
		  case ARRAY_INIT: case OBJECT_INIT:
		  	node.varType = "Object";
  			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]);
			}
			break;
		  
		  case PLUS: // TODO: This is pretty complicate type case
  			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]); // should do a type check here
			}
		  	if (node[0].varType == "Number" && node[1].varType == "Number")
		  		node.varType = "Number";
		  	if (node[0].varType == "String" || node[1].varType == "String")
		  		node.varType = "String";
			break;
		  case CONDITIONAL:
		  	// pull out comparisons with right-side yields into their own
		  	// statements and transform them separately.
		  	var cond = node[0];
		  	var left = node[1];
		  	var right = node[2];
					  	
		  	node[0] = cond = execute(cond);
		  	if (!isYielding(left) && !isYielding(right)) {
		  		node[1] = execute(left);
		  		node[2] = execute(right);
		  		break;
		  	}

			var condVar = "_c" + codePtrSequence;
			
			// put the left in it's own assign statement
			statements.push(noderize({
				type: SEMICOLON,
				expression: codeNode("var ~", condVar)
			}));
			
			// create an if node that checks the guarded value and executes
			// the right if appropriate
			var guard = noderize({
				type: IF,
				condition: cond,
				thenPart: noderize({
					type: SEMICOLON,
					expression: noderize({
						type: ASSIGN,
						0: codeNode(condVar),
						1: left,
						yielding: true
					}),
					parent: node,
					yielding: true
				}),
				elsePart: noderize({
					type: SEMICOLON,
					expression: noderize({
						type: ASSIGN,
						0: codeNode(condVar),
						1: right,
						yielding: true
					}),
					parent: node,
					yielding: true
				}),
				yielding: true
			});
			// execute the if node as if it were top-level
			var tmpStack = stack;
			stack = [];
			statements.push(execute(guard));
			stack = tmpStack;
			
			// finally, hand back the result of the guarding process
			node.type = NJS_CODE;
			node.value = condVar;
		  	break;
		  case BITWISE_OR: case BITWISE_XOR: case BITWISE_AND:
		  case BITWISE_NOT:
		  case VOID: 		  
		  case IN: 
		  case COMMA: 
		  case LIST:
		  case GROUP: case BLOCK:
			for (var i = 0; i < node.length; i++) {
				node[i] = execute(node[i]);
			}
			break;
		  case OBJECT_ID_REFERENCE:
		  	var get = noderize({
						type: CALL,
						parent: node.parent,
						yielding: true,
						0: codeNode("_ref"),
						1: noderize({
							type:LIST,
							0:node[0]})});
		  	get = execute(get);
		  	node.type = get.type;
		  	node.value = get.value;
		  	node.varType = new ObjectType(scopeResolver.scopeObject,node[0].value);
		  	break;
		  case IS:
		  	node.type = CALL;
		  	node[1] = execute(noderize({type: LIST,
		  													0: node[0],
		  													1: node[1]}));
		  	node[0] = codeNode("_is");
		  	break;
		  case INDEX: 
		  	if (options.persistence && withinYielding(node) && node.parent.type != CALL) {
			  	var get = noderize({
							type: CALL,
							parent: node.parent,
							yielding: true,
							0: codeNode("_g"),
							1: noderize({
								type:LIST,
								0:node[0],
								1:node[1]})});
			  	get = execute(get);
			  	node.type = get.type;
			  	node.value = get.value;
			  	break;
			}
			// else fall through
		  case TRANSIENT_INDEX:
				for (var i = 0; i < node.length; i++) {
					node[i] = execute(node[i]);
				}
				node.type = INDEX;
				break;
		  case DOT:
			if (options.persistence && withinYielding(node) && node.parent.type != CALL) {			// don't execute n[1] because it might resolve to a scoped var		
			  	var get = noderize({
							type: CALL,
							parent: node.parent,
							yielding: true,
							0: codeNode("_g"),
							1: noderize({
								type:LIST,
								0:node[0],
								1:codeNode('"' + node[1].value + '"')})});
			  	get = execute(get);
			  	node.type = get.type;
			  	node.value = get.value;
			  	if (typeof node[0].varType == "Object")
			  		node.varType = new ObjectType(node[0].varType.getValue(),node[1].value);
			  	break;
			}
			// else fall through to TRANSIENT_DOT
		  case TRANSIENT_DOT:
//		  		if (!options.persistence)
	//				throw new Error("direct reference syntax (.#) not supported without persevere");
			  	node[0] = execute(node[0]);
				node.type = DOT;
		  		break;

		  case PROPERTY_INIT:
			// don't execute n[0] because it might resolve to a scoped var
		  	node[1] = execute(node[1]);
		  	break;

		  default:
			throw new Error("PANIC: unknown node type " + Narcissus.tokens[node.type]);
		}
		
		return stack.pop();
	}
	
	function subst(str /*, ... */) {
		for(var i = 1; i < arguments.length; i++) {
			str = str.replace("~", arguments[i]);
		}
		return str;
	}

	function replaceNode(node) {
		stack.pop();
		stack.push(node);
	}
	
	function execBlock(set) {
		if (set.type == BLOCK) {

			for (var i = 0; i < set.length; i++) {
				statements.push(execute(set[i]));
			}
			return set;
		} else {
			set = execute(set);
			statements.push(set);
			return set;
		}
	}
	
	function newCodeSegment(id) {
		var newNode = newCodeSegmentNode(id);
		newNode.codeSegmentId = id;
		statements.push(newNode);
	}
	
	function newCodeSegmentNode(id) {
		return codeNode("case ~:", id)
	}
	
	function gotoCodeSegment(id) {
		addCode("_cp=~;break;",id);
	}

	function newConditional(node, thenPtr, elsePtr) {
		// turn the if(cond) into something like:
		//   njf0.cp = (cond) ? 1 : 2; break; case 1:
		statements.push(noderize({
			type: NJS_CODE,
			value: subst("_cp=("),
			lineno: node.lineno
		}));
		statements.push(node);
		addCode(")?~:~;break;", thenPtr, elsePtr);
	}
	
	function addCode(str/*, ...*/) {
		statements.push(codeNode.apply(this, arguments));
	}
	
	function codeNode(str/*, ...*/) {
		return noderize({
			type: NJS_CODE,
			value: subst.apply(this, arguments)
		})
	}

	function isYielding(node) {
		return node != null && node.yielding;
	}
	function withinYielding(node) {
		var parentNode = node;
		while (parentNode) {
			if (parentNode.type == FUNCTION)
				return parentNode.yielding;
			parentNode = parentNode.parent;
		}
		return false;
	}
		
	function removeLineNumbers(node) {
		delete node.lineno;
		for (n in node) {
			if (node[n] != null 
			    && typeof(node[n]) == "object" 
			    && n != "parent"
			    && node[n].isNode) 
			{
				removeLineNumbers(node[n]);
			}
		}
	}
	function exceptingGet(object,field) {
		var value = pjs.get(object,field);
		if (value == strands.Suspension)
			throw value;
		return value;
	}
	function typeCheck(variable, value) {
		if (!options.typeChecking)
			return value;
		var valueType = value.varType;
		if (typeof valueType == "object") // we allow varTypes to be just strings but usually they are objects
			valueType = valueType.type;
		if (!valueType)
			valueType = scopeResolver.getType(value.value);
		if (!valueType)
			valueType = ANY_TYPE;
		if (!variable || variable == ANY_TYPE)
			return value;
		if (typeof variable != "string")
			var variableType =scopeResolver.getType(variable.value);
		if (variableType && variableType != valueType && variableType != ANY_TYPE)
			addError("Can not assign a value of type " + valueType + " when a " + variableType + " is required");
		if (value.varType) {
			variableType = scopeResolver.getSymbolObject(variable.value);
			if (variableType)
				variableType.value = value.varType.value;
		}
		return value;
	}
	function addError(message) {
		strandscp.currentError = strandscp.currentError.next ={message:message, lineNumber:lineno || 0};
	}
}
var FUNCTION_TYPE = {value:"function"};
var ANY_TYPE = {toString:function() {return "any"}};	


function StrandsScopeResolver() {
	this.scopes = [];
	this.yieldingStatus = [];
}

var nsrp = StrandsScopeResolver.prototype;
nsrp.addError = function(message) {
	strandscp.currentError = strandscp.currentError.next ={message:message, lineNumber:lineno || 0};
}
nsrp.push = function(n, isYielding) {
	this.scopes.push({});
	this.yieldingStatus.push(isYielding);
	if(n.varDecls) {
		for(var i = 0; i < n.varDecls.length; i++) {
			this.addSymbol(n.varDecls[i].value,n.varDecls[i].varType||ANY_TYPE);
		}
	}
	if(n.funDecls) {
		for(var i = 0; i < n.funDecls.length; i++) {
			this.addSymbol(n.funDecls[i].name,FUNCTION_TYPE);
		}
	}
}
nsrp.pop = function() {
	this.yieldingStatus.pop();
	return this.scopes.pop();
}

// we need to namespace all symbols so that we don't
// accidentally run across native object members
// (such as "constructor")
nsrp.addSymbol = function(name,type) {
	this.scopes.top()[name] = {type:type.value};
	return this.getSymbol(name);
}
nsrp.getType = function(name) {
	var object = this.getSymbolObject(name);
	if (object && object.type=="any")
		return ANY_TYPE;
	if (object && typeof object.type=="string" && object.type != "String" && object.type != "Number" && object.type != "Boolean"&& object.type != "Object" && object.type != "function") {
		var symbolObject = this.getSymbolObject(object.type);
		if (!symbolObject || !symbolObject.value) 
			this.addError("You must use a known symbol with a known value as a type",lineno);
		object.type = this.getSymbolObject(object.type).value;
	}
	if (object && object.type)
		return object.type;
	return ANY_TYPE;
}
nsrp.getSymbolObject = function(name) {
	for (var i = this.scopes.length; i > 0;) {
		i--;
		if (this.scopes[i][name]) 
			return this.scopes[i][name];
	}
	return;
}

nsrp.getSymbol = function(name) {
	if(!this.scopes.top()[name] && Object.prototype[name])
		throw new Exception("You can not reference a variable in a outer scope (or global scope) with a name from Object.prototype.  Please rename your variable in order to reference it");
	if (!this.globalChecking || window[name] || this.scopeObject[name])
		return name;
	for (var i = this.scopes.length; i > 0;) {
		i--;
		if (this.scopes[i][name]) 
			return name;
	}
	this.addError("The identifier " + name + " was not found");	
	return name;
}
nsrp.getCurrentFrame = function() {
	var id = this.scopes.length - 1;
	if (id < 0) {
		throw new Error("compiler error: empty scope resolver");
	}
	return "njf" + id;
}
nsrp.isYielding = function() {
	if(this.scopes.length == 0)
		return false;
	
	return this.yieldingStatus.top();
}

nsrp.dump = function() {
	for (var i= this.scopes.length - 1; i >= 0; i--) {
		var list = "frame " + i + ": ";
		for (var n in this.scopes[i]) 
			list += n + ", ";

		print(list);
	}
}

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narrative JavaScript compiler.
 *
 * The Initial Developer of the Original Code is
 * Neil Mix (neilmix -at- gmail -dot- com).
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function StrandsScriptWriter() {
	this.lines = [];
	this.infix_lookup = {};
	for( var i = 0; i < this.infix_operators.length; i++ ) {
		this.infix_lookup[this.infix_operators[i]] = true;
	}
	this.prefix_lookup = {};
	for( var i = 0; i < this.prefix_operators.length; i++ ) {
		this.prefix_lookup[this.prefix_operators[i]] = true;
	}
	this.simple_lookup = {};
	for( var i = 0; i < this.simple_tokens.length; i++ ) {
		this.simple_lookup[this.simple_tokens[i]] = true;
	}
}

StrandsScriptWriter.dump = function(n) {
	var o = new StrandsScriptWriter();
	o.add(n);
	print(o);
}

var strandsswp = StrandsScriptWriter.prototype;

strandsswp.infix_operators = [
	 ',',
	 '||',
	 '&&',
	 '|',
	 '^',
	 '&',
	 '===',
	 '==',
	 '!==',
	 '!=',
	 '<<',
	 '<=',
	 '<',
	 '>>>',
	 '>>',
	 '>=',
	 '>',
	 '-',
	 '+',
	 '*',
	 '/',
	 '%',
	 '.',
	 '.#',
	 '='
];

strandsswp.prefix_operators = [
	'!',
	'~',
	'unary_plus',
	'unary_minus'
];

strandsswp.simple_tokens = [
	"identifier",
	"number",
	"regexp",
	"true",
	"false",
	"null",
	"this"
];

strandsswp.add = function(n) {
	if( n == null ) 
	throw new Error("null token");
	if( arguments.length > 1 ) throw new Error("too many args");
	if( Narcissus.tokens[n.type] == null ) throw new Error("not a valid token: " + n);
	var type = Narcissus.tokens[n.type].toLowerCase();
	var method = "write_" + type;
	if( this[method] ) {
		this[method](n);
	} else if( this.infix_lookup[type] ) {
		this.write_infix_operator(n);
	} else if( this.prefix_lookup[type] ) {
		this.write_prefix_operator(n);
	} else if( this.simple_lookup[type] ) {
		this.write(n, n.value);
	} else {
		throw new Error("ScriptWriter Error: unknown type: " + Narcissus.tokens[n.type]);
	}
}

strandsswp.addBlock = function(n) {
	// the compiler can rewrite single statements into multiple statements
	// therefore, we should put brackets around single statements to be safe.
	if(n.type == Narcissus.BLOCK) {
		this.add(n);
	} else {
		this.write(n, "{");
		this.add(n);
		this.write(null, "}");
	}
}

strandsswp.write = function(n, text) {
	if (text == null) 
		throw new Error("null text: " + n);
	var lineno = n && n.lineno >= this.lines.length ? n.lineno : this.lines.length - 1;
	var line = this.lines[lineno] || [];
	line.push(text);
	this.lines[lineno] = line;
}

strandsswp.last = function() {
	return this.lines.top().top();
}

strandsswp.pop = function() {
	return this.lines.top().pop();
}

strandsswp.toString = function() {
	var output = [];
	// Note: line numbers start at 1
	for( var i = 1; i < this.lines.length+1; i++ ) {
		if( this.lines[i] != null ) {
			if (this.debug && this.sourceLines[i-1])
				output.push("/*" + this.sourceLines[i-1].replace(/\*\//g,'* ') + "\t\t\t\t\t\t*/");
			for( var j = 0; j < this.lines[i].length; j++ ) {
				output.push(this.lines[i][j]);
			}
		}
		else {
			if (this.debug && this.sourceLines[i-1])
				output.push("/*" + this.sourceLines[i-1].replace(/\*\//g,'* ') + "\t\t\t\t\t\t*/");
		}
		output.push("\n");
	}
	return output.join("");
}

strandsswp.write_script = function(n,output) {
	for (var i = 0; i < n.length; i++) {
		this.add(n[i]);
	}
}

strandsswp.write_infix_operator = function(n) {
	this.add(n[0]);
	if (n.type == Narcissus.ASSIGN && n[0].assignOp != null)
		this.write(n, Narcissus.tokens[n[0].assignOp]);
	this.write(n, Narcissus.tokens[n.type]); // don't use n.value -- that's incorrect for DOT
	this.add(n[1]);
}

strandsswp.write_prefix_operator = function(n) {
	this.write(n, n.value);
	this.add(n[0]);
}

strandsswp.write_function = function(n) {
	if(n.scoped) {
		this.write(n, n.name);
		this.write(n, " = ");
	}
	this.write(n, "function");
	if(n.name && !n.scoped) {
		this.write(n, " ");
		this.write(n, n.name);
	}
	this.write(n, "(");
	for (var i = 0; i < n.params.length; i++)
		if (n.params[i].value)
			n.params[i] = n.params[i].value;
	this.write(n, n.params);
	this.write(null, "){");
	this.add(n.body);
	this.write(null, "}");
	if(n.scoped) {
		this.write(null, ";");
	}
}

strandsswp.write_var = function(n) {
	if(!n.scoped) this.write(n, "var ");
	for( var i = 0; i < n.length; i++ ) {
		this.write(n[i], n[i].value);
		if( n[i].initializer ) {
			this.write(n[i], "=");
			this.add(n[i].initializer);
		}
		if( i == n.length - 1 ) {
			this.write(null, ";");
		} else {
			this.write(n[i], ",");
		}
	}
}

strandsswp["write_;"] = function(n) {
	if(!n.expression) 
		return;
	this.add(n.expression);
	this.write(null, ";");
}


strandsswp.write_conditional = function(n) {
	this.add(n[0]);
	this.write(null, "?");
	this.add(n[1]);
	this.write(null, ":");
	this.add(n[2]);
}

strandsswp["write_++"] = function(n) {
	if( n.postfix ) {
		this.add(n[0]);
		this.write(n, "++");
	} else {
		this.write(n, "++");
		this.add(n[0]);
	}
}

strandsswp["write_--"] = function(n) {
	if( n.postfix ) {
		this.add(n[0]);
		this.write(n, "--");
	} else {
		this.write(n, "--");
		this.add(n[0]);
	}
}

strandsswp.write_index = function(n) {
	this.add(n[0]);
	this.write(null, '[');
	this.add(n[1]);
	this.write(null, ']');
}

strandsswp.write_array_init = function(n) {
	this.write(n, '[');
	for( var i = 0; i < n.length; i++ ) {
		if (i > 0) {
			this.write(null, ",");
		}
		this.add(n[i]);
	}
	this.write(null, ']');
}

strandsswp.write_object_init = function(n) {
	this.write(n, '{');
	for(var i = 0; i < n.length; i++) {
		this.add(n[i]);
		if( i != n.length - 1 ) {
			this.write(n[i], ',');
		}
	}
	this.write(null, '}');
}

strandsswp.write_property_init = function(n) {
	this.add(n[0]);
	this.write(n[0], ':');
	this.add(n[1]);
}

strandsswp.write_block = function(n) {
	this.write(n, '{');
	for( var i = 0; i < n.length; i++ ) {
		this.add(n[i]);
	}
	this.write(null, "}");
}

strandsswp.write_group = function(n) {
	this.write(n, '(');
	for( var i = 0; i < n.length; i++ ) {
		this.add(n[i]);
	}
	this.write(null, ")");
}

strandsswp.write_list = function(n) {
	this.write(null, '(');
	for( var i = 0; i < n.length; i++ ) {
		this.add(n[i]);
		if( i != n.length - 1 ) {
			this.write(null, ",");
		}
	}
	this.write(n, ')');
}

strandsswp.write_label = function(n) {
	this.write(n, n.label);
	this.write(n, ":");
	this.add(n.statement);
}

strandsswp.write_for = function(n) {
	this.write(n, "for(");
	this.add(n.setup);
	// var statements are never associated with a semicolon, so our
	// write statements automatically insert one.  Therefore, we
	// need to check if a semicolon was already inserted for us.
	if(this.last() != ';') this.write(null, ";");
	this.add(n.condition);
	this.write(null, ";");
	this.add(n.update);
	this.write(null, ")");
	this.add(n.body);
}

strandsswp.write_call = function(n) {
	this.add(n[0]);
	this.add(n[1]);
}

strandsswp.write_new_with_args = function(n) {
	this.write(n, "new ");
	this.add(n[0]);
	if (n[1])
		this.add(n[1]);
}

strandsswp.write_new = function(n) {
	this.write(n, "new ");
	this.add(n[0]);
	this.write(null, "()");
}

strandsswp.write_string = function(n) {
	var value = n.value.replace(/(\\|")/g, "\\$1");
	value = value.replace(/\n/g, "\\n");
	this.write(n, '"');
	this.write(n, value);
	this.write(n, '"');
}

strandsswp.write_switch = function(n) {
	this.write(n, "switch(");
	this.add(n.discriminant);
	this.write(null, "){");
	for( var i = 0; i < n.cases.length; i++ ) {
		this.add(n.cases[i]);
	}
	this.write(null, "}");
}

strandsswp.write_case = function(n) {
	this.write(n, "case ");
	this.add(n.caseLabel);
	this.write(null, ":");
	this.add(n.statements);
}

strandsswp.write_default = function(n) {
	this.write(n, "default:");
	this.add(n.statements);
}

strandsswp.write_delete = function(n) {
	this.write(n, "delete ");
	for( var i = 0; i < n.length; i++ ) {
		this.add(n[i]);
	}
}

strandsswp.write_while = function(n) {
	this.write(n, "while(");
	this.add(n.condition);
	this.write(null, ")");
	this.add(n.body);
}

strandsswp.write_do = function(n) {
	this.write(n, "do");
	this.add(n.body);
	this.write(n.condition, " while(");
	this.add(n.condition);
	this.write(null, ");");
}

strandsswp.write_if = function(n) {
	this.write(n, "if(");
	this.add(n.condition);
	this.write(null, ")");
	this.addBlock(n.thenPart);
	if(n.elsePart != null ) {
		this.write(n.elsePart, " else ");
		this.add(n.elsePart);
	}
}

strandsswp.write_typeof = function(n) {
	this.write(n, "typeof ");
	this.add(n[0]);
}
strandsswp.write_instanceof = function(n) {
	this.add(n[0]);
	this.write(n, " instanceof ");
	this.add(n[1]);
}

strandsswp.write_try = function(n) {
	this.write(n, "try ");
	this.add(n.tryBlock);
	for( var i = 0; i < n.catchClauses.length; i++ ) {
		var clause = n.catchClauses[i];
		this.write(clause, " catch(");
		this.write(null, clause.varName);
		if (clause.guard) {
			this.write(null, " if(");
			this.add(clause.guard);
			this.write(null, ")");
		}
		this.write(null, ")");
		this.add(clause.block);
	}
	if( n.finallyBlock != null ) {
		this.write(n.finallyBlock, " finally ");
		this.add(n.finallyBlock);
	}
}

strandsswp.write_throw = function(n) {
	this.write(n, "throw(");
	this.add(n.exception);
	this.write(n, ");");
}

strandsswp.write_for_in = function(n) {
	this.write(n, "for(");
	if( n.varDecl == null ) {
		this.add(n.iterator);
	} else {
		this.add(n.varDecl);
		// variable writes automatically add a semicolon,
		// we need to remove it.
		this.pop();
	}
	this.write(null, " in ");
	this.add(n.object);
	this.write(null, ")");
	this.add(n.body);
}

strandsswp.write_with = function(n) {
	this.write(n, "with(");
	this.add(n.object);
	this.write(null, ")");
	this.add(n.body);
}

strandsswp.write_void = function(n) {
	this.write(n, "void ");
	this.add(n[0]);
}

strandsswp.write_break = function(n) {
	this.write(n, "break;");
}

strandsswp.write_continue = function(n) {
	this.write(n, "continue;");
}

strandsswp.write_debugger = function(n) {
	this.write(n, "debugger;");
}

strandsswp.write_return = function(n) {
	this.write(n, "return");
	if( n.expression ) { // yes, value has two possible meanings...
		this.write(null, " ");
		this.add(n.expression);
	}
	this.write(null, ";");
}

strands.compiler = new StrandsCompiler({exceptions: true, persistence:false, compress : false});
strands.compiler.loadAndCompile = function(url){
	var frame = _frm(this,arguments,['url'],[]);
	var result = strands.request(frame.url,'GET');		
	if (result == frame._S) return frame._s();
	eval(this.compile(result),url);
}
strands.compiler.Function = function(source,thisObject,scopeObject,runAt) {
	with(_frm(this,arguments,['source','thisObject','scopeObject','runAt'],[])) {
		if (!source)
			source = "function() {\n}";
		 var code = this.compile("temp=" + source, "input",thisObject,scopeObject);
		 if (code == _S) return _s();	 
		var func = eval(code);
		if (runAt == "server") {
			func = function() {
				persevere.serverCall(this,arguments);
			}
			func._psv15 = func.toString();
		}
		else
			func._psv15 = code.substring(5,code.length-3);
		func['function'] = source;
		if (runAt)
			func.runAt = runAt;
		return func;
		}
}

strands.request = function(url, method, postData) {
	var frame = _frm(this,arguments,[],[]);
	if (frame._cp == 0) {
		var getXMLHttpRequest = function () {
			if (parent.XMLHttpRequest)
		        return new parent.XMLHttpRequest();
			else if (window.ActiveXObject)
		        return new ActiveXObject("Microsoft.XMLHTTP");
		}
	 	var xhr = getXMLHttpRequest();
		frame.future = new Future();
		var ajaxDataReader = function () {
			if (xhr.readyState == 4) {
		        // only if "OK"
		        var loaded;
		        try {
		        	var status = xhr.status;
		        	loaded = xhr.responseText.length > 0;//firefox can throw an exception right here
		        } catch(e) {}
		        if (loaded) 
    				frame.future.fulfill(xhr.responseText);				
				else
					frame.future.interrupt();
        		xhr = null; // This is to correct for IE memory leak
			}
		}
		frame._cp = 1;
	    xhr.open(method || "POST", url, true); 
		xhr.onreadystatechange = ajaxDataReader;
	    xhr.send(postData);
	}
	var result = frame.future.result();
	if (result == frame._S) frame._s();
	return result;
}
strands.compiler.tryCatchCompile = function(source,name,persistence,debug) {
	try {
		this.options.persistence = persistence;
		this.options.debug = debug;
		return this.compile(source);
	}
	catch (e) {
		return "alert('ERROR in " + name.replace(/'/g,'') + ": line " + e.lineNumber + ": " + e.message + "');";
	}
}

