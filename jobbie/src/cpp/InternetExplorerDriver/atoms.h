/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef WD_GET_ATTRIBUTE_H
#define WD_GET_ATTRIBUTE_H

const wchar_t* WD_GET_ATTRIBUTE[] = {
L"var wdGetAttribute=function(){var e=this;function f(a){return typeof a==\"string\"}function h(a){var c=Array.prototype.slice.call(arguments,1);return function(){var b=Array.prototype.slice.call(arguments);b.unshift.apply(b,c);return a.apply(this,b)}}function i(a,c){function b(){}b.prototype=c.prototype;a.g=c.prototype;a.prototype=new b};",
L"function j(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}i(j,Error);function k(a){for(var c=1;c<arguments.length;c++){var b=String(arguments[c]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,b)}return a};function l(a,c){c.unshift(a);j.call(this,k.apply(null,c));c.shift();this.f=a}i(l,j);function m(a,c,b,d){var g=\"Assertion failed\";if(b){g+=\": \"+b;var x=d}else if(a){g+=\": \"+a;x=c}throw new l(\"\"+g,x||[]);}function n(a,c){!a&&m(\"\",null,c,Array.prototype.slice.call(arguments,2))}function o(a,c){typeof a!=\"number\"&&m(\"Expected number but got %s.\",[a],c,Array.prototype.slice.call(arguments,2));return a};var p=Array.prototype,q=p.indexOf?function(a,c,b){n(a||f(a));o(a.length);return p.indexOf.call(a,c,b)}:function(a,c,b){b=b==null?0:b<0?Math.max(0,a.length+b):b;if(f(a)){if(!f(c)||c.length!=1)return-1;return a.indexOf(c,b)}for(b=b;b<a.length;b++)if(b in a&&a[b]===c)return b;return-1};var r,s,t,u;function v(){return e.navigator?e.navigator.userAgent:null}u=t=s=r=false;var w;if(w=v()){var y=e.navigator;r=w.indexOf(\"Opera\")==0;s=!r&&w.indexOf(\"MSIE\")!=-1;t=!r&&w.indexOf(\"WebKit\")!=-1;u=!r&&!t&&y.product==\"Gecko\"}var z=s,A=u,B=t,C=\"\",D;if(r&&e.opera){var E=e.opera.version;C=typeof E==\"function\"?E():E}else{if(A)D=/rv\\:([^\\);]+)(\\)|;)/;else if(z)D=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(B)D=/WebKit\\/(\\S+)/;if(D){var F=D.exec(v());C=F?F[1]:\"\"}};function G(a,c,b,d){if(typeof d==\"number\")d=(c?Math.round(d):d)+\"px\";b.style[a]=d}h(G,\"height\",true);h(G,\"width\",true);",
L"function H(a,c,b,d,g){this.c=!!c;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=g!=undefined?g:this.d||0;if(this.c)this.a*=-1;this.e=!b}i(H,function(){});H.prototype.b=null;H.prototype.d=null;i(function(a,c,b,d){H.call(this,a,c,b,null,d)},H);",
L"var I={\"class\":\"className\",readonly:\"readOnly\"},J=[\"checked\",\"disabled\",\"readonly\",\"selected\"];function K(a,c){if(8==a.nodeType)return null;var b=c.toLowerCase();if(\"style\"==b)return\"\";var d=a.getAttributeNode(c);if(!d)return null;if(q(J,b)>=0)return z&&d.value==\"false\"?null:true;return d.specified?d.value:null};",
L"var L=[\"checkbox\",\"radio\"];function M(a){var c=a.tagName.toUpperCase();if(c==\"OPTION\")return true;if(c==\"INPUT\")if(q(L,a.type)>=0)return true;return false};function N(a,c){var b=null,d=c.toLowerCase();if(\"style\"==c.toLowerCase()){if((b=a.style)&&!f(b))b=b.cssText;return b}if(\"selected\"==d||\"checked\"==d&&M(a)){if(M(a)){b=\"selected\";d=a.type&&a.type.toLowerCase();if(\"checkbox\"==d||\"radio\"==d)b=\"checked\";b=!!a[b]}else b=false;return b?\"true\":null}a[I[c]||c]===null||(b=a[I[c]||c]);if(d=b===undefined)d=K(a,c)!==null;if(d)b=K(a,c);return b||b===\"\"?b.toString():null}var O=\"_\".split(\".\"),P=e;!(O[0]in P)&&P.execScript&&P.execScript(\"var \"+O[0]);",
L"for(var Q;O.length&&(Q=O.shift());)if(!O.length&&N!==undefined)P[Q]=N;else P=P[Q]?P[Q]:P[Q]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef WD_IS_SELECTED_H
#define WD_IS_SELECTED_H

const wchar_t* WD_IS_SELECTED[] = {
L"var wdIsSelected=function(){var e=this;function f(a){var b=Array.prototype.slice.call(arguments,1);return function(){var c=Array.prototype.slice.call(arguments);c.unshift.apply(c,b);return a.apply(this,c)}}function h(a,b){function c(){}c.prototype=b.prototype;a.g=b.prototype;a.prototype=new c};",
L"function i(a){this.stack=Error().stack||\"\";if(a)this.message=String(a)}h(i,Error);function j(a){for(var b=1;b<arguments.length;b++){var c=String(arguments[b]).replace(/\\$/g,\"$$$$\");a=a.replace(/\\%s/,c)}return a};function k(a,b){b.unshift(a);i.call(this,j.apply(null,b));b.shift();this.f=a}h(k,i);function l(a,b,c,d){var g=\"Assertion failed\";if(c){g+=\": \"+c;var w=d}else if(a){g+=\": \"+a;w=b}throw new k(\"\"+g,w||[]);}function m(a,b){!a&&l(\"\",null,b,Array.prototype.slice.call(arguments,2))}function n(a,b){typeof a!=\"number\"&&l(\"Expected number but got %s.\",[a],b,Array.prototype.slice.call(arguments,2));return a};var o=Array.prototype,p=o.indexOf?function(a,b,c){m(a||typeof a==\"string\");n(a.length);return o.indexOf.call(a,b,c)}:function(a,b,c){c=c==null?0:c<0?Math.max(0,a.length+c):c;if(typeof a==\"string\"){if(typeof b!=\"string\"||b.length!=1)return-1;return a.indexOf(b,c)}for(c=c;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1};var q,r,s,t;function u(){return e.navigator?e.navigator.userAgent:null}t=s=r=q=false;var v;if(v=u()){var x=e.navigator;q=v.indexOf(\"Opera\")==0;r=!q&&v.indexOf(\"MSIE\")!=-1;s=!q&&v.indexOf(\"WebKit\")!=-1;t=!q&&!s&&x.product==\"Gecko\"}var y=r,z=t,A=s,B=\"\",C;if(q&&e.opera){var D=e.opera.version;B=typeof D==\"function\"?D():D}else{if(z)C=/rv\\:([^\\);]+)(\\)|;)/;else if(y)C=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(A)C=/WebKit\\/(\\S+)/;if(C){var E=C.exec(u());B=E?E[1]:\"\"}};function F(a,b,c,d){if(typeof d==\"number\")d=(b?Math.round(d):d)+\"px\";c.style[a]=d}f(F,\"height\",true);f(F,\"width\",true);",
L"function G(a,b,c,d,g){this.c=!!b;if(a){if(this.b=a)this.d=typeof d==\"number\"?d:this.b.nodeType!=1?0:this.c?-1:1;if(typeof void 0==\"number\")this.a=void 0}this.a=g!=undefined?g:this.d||0;if(this.c)this.a*=-1;this.e=!c}h(G,function(){});G.prototype.b=null;G.prototype.d=null;h(function(a,b,c,d){G.call(this,a,b,c,null,d)},G);",
L"",
L"var H=[\"checkbox\",\"radio\"];function I(a){var b;a:{b=a.tagName.toUpperCase();if(b==\"OPTION\")b=true;else{if(b==\"INPUT\")if(p(H,a.type)>=0){b=true;break a}b=false}}if(!b)return false;b=\"selected\";var c=a.type&&a.type.toLowerCase();if(\"checkbox\"==c||\"radio\"==c)b=\"checked\";return!!a[b]}var J=\"_\".split(\".\"),K=e;!(J[0]in K)&&K.execScript&&K.execScript(\"var \"+J[0]);for(var L;J.length&&(L=J.shift());)if(!J.length&&I!==undefined)K[L]=I;else K=K[L]?K[L]:K[L]={};; return _.apply(null,arguments);};",
NULL
};

#endif

