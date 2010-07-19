/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef GET_ATTRIBUTE_H
#define GET_ATTRIBUTE_H

const wchar_t* GET_ATTRIBUTE[] = {
L"var getAttribute=function(){var e=this;function f(a){var c=Array.prototype.slice.call(arguments,1);return function(){var b=Array.prototype.slice.call(arguments);b.unshift.apply(b,c);return a.apply(this,b)}}function h(a,c){function b(){}b.prototype=c.prototype;a.g=c.prototype;a.prototype=new b};",
L"function i(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}h(i,Error);function j(a){for(var c=1;c<arguments.length;c++){var b=String(arguments[c]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,b)}return a};function k(a,c){c.unshift(a);i.call(this,j.apply(null,c));c.shift();this.f=a}h(k,i);function l(a,c,b,d){var g=\"Assertion failed\";if(b){g+=\": \"+b;var w=d}else if(a){g+=\": \"+a;w=c}throw new k(\"\"+g,w||[]);}function m(a,c){!a&&l(\"\",null,c,Array.prototype.slice.call(arguments,2))}function n(a,c){typeof a!=\"number\"&&l(\"Expected number but got %s.\",[a],c,Array.prototype.slice.call(arguments,2));return a};var o=Array.prototype,p=o.indexOf?function(a,c,b){m(a||typeof a==\"string\");n(a.length);return o.indexOf.call(a,c,b)}:function(a,c,b){b=b==null?0:b<0?Math.max(0,a.length+b):b;if(typeof a==\"string\"){if(typeof c!=\"string\"||c.length!=1)return-1;return a.indexOf(c,b)}for(b=b;b<a.length;b++)if(b in a&&a[b]===c)return b;return-1};var q,r,s,t;function u(){return e.navigator?e.navigator.userAgent:null}t=s=r=q=false;var v;if(v=u()){var x=e.navigator;q=v.indexOf(\"Opera\")==0;r=!q&&v.indexOf(\"MSIE\")!=-1;s=!q&&v.indexOf(\"WebKit\")!=-1;t=!q&&!s&&x.product==\"Gecko\"}var y=r,z=t,A=s,B=\"\",C;if(q&&e.opera){var D=e.opera.version;B=typeof D==\"function\"?D():D}else{if(z)C=/rv\\:([^\\);]+)(\\)|;)/;else if(y)C=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(A)C=/WebKit\\/(\\S+)/;if(C){var E=C.exec(u());B=E?E[1]:\"\"}};function F(a,c,b,d){if(typeof d==\"number\")d=(c?Math.round(d):d)+\"px\";b.style[a]=d}f(F,\"height\",true);f(F,\"width\",true);",
L"function G(a,c,b,d,g){this.c=!!c;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=g!=undefined?g:this.d||0;if(this.c)this.a*=-1;this.e=!b}h(G,function(){});G.prototype.b=null;G.prototype.d=null;h(function(a,c,b,d){G.call(this,a,c,b,null,d)},G);",
L"var H=[\"checked\",\"disabled\",\"readonly\",\"selected\"];function I(a,c){if(8==a.nodeType)return null;var b=c.toLowerCase();if(\"style\"==b)return\"\";var d=a.getAttributeNode(c);if(!d)return null;if(p(H,b)>=0)return y&&d.value==\"false\"?null:true;return d.specified?d.value:null}var J=\"_\".split(\".\"),K=e;!(J[0]in K)&&K.execScript&&K.execScript(\"var \"+J[0]);for(var L;J.length&&(L=J.shift());)if(!J.length&&I!==undefined)K[L]=I;else K=K[L]?K[L]:K[L]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef GET_PROPERTY_H
#define GET_PROPERTY_H

const wchar_t* GET_PROPERTY[] = {
L"var getProperty=function(){var e=this;function f(a){var b=Array.prototype.slice.call(arguments,1);return function(){var c=Array.prototype.slice.call(arguments);c.unshift.apply(c,b);return a.apply(this,c)}}function g(a,b){function c(){}c.prototype=b.prototype;a.g=b.prototype;a.prototype=new c};",
L"function h(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}g(h,Error);function i(a){for(var b=1;b<arguments.length;b++){var c=String(arguments[b]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,c)}return a};g(function(a,b){b.unshift(a);h.call(this,i.apply(null,b));b.shift();this.f=a},h);var j,k,l,m;function n(){return e.navigator?e.navigator.userAgent:null}m=l=k=j=false;var o;if(o=n()){var p=e.navigator;j=o.indexOf(\"Opera\")==0;k=!j&&o.indexOf(\"MSIE\")!=-1;l=!j&&o.indexOf(\"WebKit\")!=-1;m=!j&&!l&&p.product==\"Gecko\"}var q=k,r=m,s=l,t=\"\",u;if(j&&e.opera){var v=e.opera.version;t=typeof v==\"function\"?v():v}else{if(r)u=/rv\\:([^\\);]+)(\\)|;)/;else if(q)u=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(s)u=/WebKit\\/(\\S+)/;if(u){var w=u.exec(n());t=w?w[1]:\"\"}};function y(a,b,c,d){if(typeof d==\"number\")d=(b?Math.round(d):d)+\"px\";c.style[a]=d}f(y,\"height\",true);f(y,\"width\",true);",
L"function z(a,b,c,d,x){this.c=!!b;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=x!=undefined?x:this.d||0;if(this.c)this.a*=-1;this.e=!c}g(z,function(){});z.prototype.b=null;z.prototype.d=null;g(function(a,b,c,d){z.call(this,a,b,c,null,d)},z);",
L"var A={\"class\":\"className\",readonly:\"readOnly\"};function B(a,b){return a[A[b]||b]}var C=\"_\".split(\".\"),D=e;!(C[0]in D)&&D.execScript&&D.execScript(\"var \"+C[0]);for(var E;C.length&&(E=C.shift());)if(!C.length&&B!==undefined)D[E]=B;else D=D[E]?D[E]:D[E]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef HAS_ATTRIBUTE_H
#define HAS_ATTRIBUTE_H

const wchar_t* HAS_ATTRIBUTE[] = {
L"var hasAttribute=function(){var e=this;function f(a){var b=Array.prototype.slice.call(arguments,1);return function(){var c=Array.prototype.slice.call(arguments);c.unshift.apply(c,b);return a.apply(this,c)}}function h(a,b){function c(){}c.prototype=b.prototype;a.g=b.prototype;a.prototype=new c};",
L"function i(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}h(i,Error);function j(a){for(var b=1;b<arguments.length;b++){var c=String(arguments[b]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,c)}return a};function k(a,b){b.unshift(a);i.call(this,j.apply(null,b));b.shift();this.f=a}h(k,i);function l(a,b,c,d){var g=\"Assertion failed\";if(c){g+=\": \"+c;var w=d}else if(a){g+=\": \"+a;w=b}throw new k(\"\"+g,w||[]);}function m(a,b){!a&&l(\"\",null,b,Array.prototype.slice.call(arguments,2))}function n(a,b){typeof a!=\"number\"&&l(\"Expected number but got %s.\",[a],b,Array.prototype.slice.call(arguments,2));return a};var o=Array.prototype,p=o.indexOf?function(a,b,c){m(a||typeof a==\"string\");n(a.length);return o.indexOf.call(a,b,c)}:function(a,b,c){c=c==null?0:c<0?Math.max(0,a.length+c):c;if(typeof a==\"string\"){if(typeof b!=\"string\"||b.length!=1)return-1;return a.indexOf(b,c)}for(c=c;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1};var q,r,s,t;function u(){return e.navigator?e.navigator.userAgent:null}t=s=r=q=false;var v;if(v=u()){var x=e.navigator;q=v.indexOf(\"Opera\")==0;r=!q&&v.indexOf(\"MSIE\")!=-1;s=!q&&v.indexOf(\"WebKit\")!=-1;t=!q&&!s&&x.product==\"Gecko\"}var y=r,z=t,A=s,B=\"\",C;if(q&&e.opera){var D=e.opera.version;B=typeof D==\"function\"?D():D}else{if(z)C=/rv\\:([^\\);]+)(\\)|;)/;else if(y)C=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(A)C=/WebKit\\/(\\S+)/;if(C){var E=C.exec(u());B=E?E[1]:\"\"}};function F(a,b,c,d){if(typeof d==\"number\")d=(b?Math.round(d):d)+\"px\";c.style[a]=d}f(F,\"height\",true);f(F,\"width\",true);",
L"function G(a,b,c,d,g){this.c=!!b;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=g!=undefined?g:this.d||0;if(this.c)this.a*=-1;this.e=!c}h(G,function(){});G.prototype.b=null;G.prototype.d=null;h(function(a,b,c,d){G.call(this,a,b,c,null,d)},G);",
L"var H=[\"checked\",\"disabled\",\"readonly\",\"selected\"];function I(a,b){if(8==a.nodeType)return null;var c=b.toLowerCase();if(\"style\"==c)return\"\";var d=a.getAttributeNode(b);if(!d)return null;if(p(H,c)>=0)return y&&d.value==\"false\"?null:true;return d.specified?d.value:null};function J(a,b){return I(a,b)!==null}var K=\"_\".split(\".\"),L=e;!(K[0]in L)&&L.execScript&&L.execScript(\"var \"+K[0]);for(var M;K.length&&(M=K.shift());)if(!K.length&&J!==undefined)L[M]=J;else L=L[M]?L[M]:L[M]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef HAS_PROPERTY_H
#define HAS_PROPERTY_H

const wchar_t* HAS_PROPERTY[] = {
L"var hasProperty=function(){var e=this;function f(a){var b=Array.prototype.slice.call(arguments,1);return function(){var c=Array.prototype.slice.call(arguments);c.unshift.apply(c,b);return a.apply(this,c)}}function g(a,b){function c(){}c.prototype=b.prototype;a.g=b.prototype;a.prototype=new c};",
L"function h(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}g(h,Error);function i(a){for(var b=1;b<arguments.length;b++){var c=String(arguments[b]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,c)}return a};g(function(a,b){b.unshift(a);h.call(this,i.apply(null,b));b.shift();this.f=a},h);var j,k,l,m;function n(){return e.navigator?e.navigator.userAgent:null}m=l=k=j=false;var o;if(o=n()){var p=e.navigator;j=o.indexOf(\"Opera\")==0;k=!j&&o.indexOf(\"MSIE\")!=-1;l=!j&&o.indexOf(\"WebKit\")!=-1;m=!j&&!l&&p.product==\"Gecko\"}var q=k,r=m,s=l,t=\"\",u;if(j&&e.opera){var v=e.opera.version;t=typeof v==\"function\"?v():v}else{if(r)u=/rv\\:([^\\);]+)(\\)|;)/;else if(q)u=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(s)u=/WebKit\\/(\\S+)/;if(u){var w=u.exec(n());t=w?w[1]:\"\"}};function y(a,b,c,d){if(typeof d==\"number\")d=(b?Math.round(d):d)+\"px\";c.style[a]=d}f(y,\"height\",true);f(y,\"width\",true);",
L"function z(a,b,c,d,x){this.c=!!b;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=x!=undefined?x:this.d||0;if(this.c)this.a*=-1;this.e=!c}g(z,function(){});z.prototype.b=null;z.prototype.d=null;g(function(a,b,c,d){z.call(this,a,b,c,null,d)},z);",
L"var A={\"class\":\"className\",readonly:\"readOnly\"};function B(a,b){return a[A[b]||b]!==null}var C=\"_\".split(\".\"),D=e;!(C[0]in D)&&D.execScript&&D.execScript(\"var \"+C[0]);for(var E;C.length&&(E=C.shift());)if(!C.length&&B!==undefined)D[E]=B;else D=D[E]?D[E]:D[E]={};; return _.apply(null,arguments);};",
NULL
};

#endif

