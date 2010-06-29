/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef GET_ATTRIBUTE_H
#define GET_ATTRIBUTE_H

const wchar_t* GET_ATTRIBUTE[] = {
L"var getAttribute=function(){var e=this;",
L"function f(a){var b=typeof a;if(b==\"object\")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)==\"[object Array]\"||typeof a.length==\"number\"&&typeof a.splice!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"splice\"))return\"array\";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)==\"[object Function]\"||typeof a.call!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"call\")))return\"function\"}else return\"null\";else if(b==",
L"\"function\"&&typeof a.call==\"undefined\")return\"object\";return b};",
L"var g=Array.prototype,h=g.indexOf?function(a,b,c){return g.indexOf.call(a,b,c)}:function(a,b,c){for(c=c==null?0:c<0?Math.max(0,a.length+c):c;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1};function i(a,b){if(a<b)return-1;else if(a>b)return 1;return 0}(Date.now||function(){return+new Date})();var j,k,l,m;function n(){return e.navigator?e.navigator.userAgent:null}m=l=k=j=false;var o;if(o=n()){var p=e.navigator;j=o.indexOf(\"Opera\")==0;k=!j&&o.indexOf(\"MSIE\")!=-1;l=!j&&o.indexOf(\"WebKit\")!=-1;m=!j&&!l&&p.product==\"Gecko\"}var q=k,r=m,s=l,t,u=\"\",v;if(j&&e.opera){var w=e.opera.version;u=typeof w==\"function\"?w():w}else{if(r)v=/rv\\:([^\\);]+)(\\)|;)/;else if(q)v=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(s)v=/WebKit\\/(\\S+)/;if(v){var x=v.exec(n());u=x?x[1]:\"\"}}t=u;var y={};if(s)if(!y[\"522\"]){var z=0,A=String(t).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),B=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),C=Math.max(A.length,B.length);for(var D=0;z==0&&D<C;D++){var E=A[D]||\"\",F=B[D]||\"\",G=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),H=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var I=G.exec(E)||[\"\",\"\",\"\"],J=H.exec(F)||[\"\",\"\",\"\"];if(I[0].length==0&&J[0].length==0)break;z=i(I[1].length==0?0:parseInt(I[1],10),J[1].length==0?0:parseInt(J[1],10))||i(I[2].length==0,J[2].length==0)||i(I[2],",
L"J[2])}while(z==0)}y[\"522\"]=z>=0};",
L"function K(a,b){if(f(a.hasAttribute)==\"function\")if(a.hasAttribute(b))return true;var c=a.attributes,d=f(c);if(d==\"array\"||d==\"object\"&&typeof c.length==\"number\")if(a.attributes[b]||a.attributes[b]==false)return true;return b in a}var L=[\"checked\",\"disabled\",\"readOnly\",\"selected\"],M={checked:[\"INPUT\"],disabled:[\"INPUT\"],readOnly:[\"INPUT\"],selected:[\"INPUT\",\"OPTION\"]};function N(a,b){var c=b.toLowerCase(),d=null;d=M[b];if(h(L,b)>=0&&h(d,a.tagName)>=0){if(!K(a,b))return false;d=a[b];return!!(d&&d!=\"false\")}if(\"style\"==c)return\"\";if(\"class\"==c)b=\"className\";if(\"readonly\"==c)b=\"readOnly\";if(!K(a,b))return null;return d=a.getAttribute(b)!=null?a.getAttribute(b):a[b]}var O=\"_\".split(\".\"),P=e;!(O[0]in P)&&P.execScript&&P.execScript(\"var \"+O[0]);for(var Q;O.length&&(Q=O.shift());)if(!O.length&&N!==undefined)P[Q]=N;else P=P[Q]?P[Q]:P[Q]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef IS_SELECTED_H
#define IS_SELECTED_H

const wchar_t* IS_SELECTED[] = {
L"var isSelected=function(){var e=this;",
L"function f(a){var b=typeof a;if(b==\"object\")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)==\"[object Array]\"||typeof a.length==\"number\"&&typeof a.splice!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"splice\"))return\"array\";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)==\"[object Function]\"||typeof a.call!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"call\")))return\"function\"}else return\"null\";else if(b==",
L"\"function\"&&typeof a.call==\"undefined\")return\"object\";return b};",
L"var g=Array.prototype,h=g.indexOf?function(a,b,c){return g.indexOf.call(a,b,c)}:function(a,b,c){for(c=c==null?0:c<0?Math.max(0,a.length+c):c;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1};function i(a,b){if(a<b)return-1;else if(a>b)return 1;return 0}(Date.now||function(){return+new Date})();var j,k,l,m;function n(){return e.navigator?e.navigator.userAgent:null}m=l=k=j=false;var o;if(o=n()){var p=e.navigator;j=o.indexOf(\"Opera\")==0;k=!j&&o.indexOf(\"MSIE\")!=-1;l=!j&&o.indexOf(\"WebKit\")!=-1;m=!j&&!l&&p.product==\"Gecko\"}var q=k,r=m,s=l,t,u=\"\",v;if(j&&e.opera){var w=e.opera.version;u=typeof w==\"function\"?w():w}else{if(r)v=/rv\\:([^\\);]+)(\\)|;)/;else if(q)v=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(s)v=/WebKit\\/(\\S+)/;if(v){var x=v.exec(n());u=x?x[1]:\"\"}}t=u;var y={};if(s)if(!y[\"522\"]){var z=0,A=String(t).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),B=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),C=Math.max(A.length,B.length);for(var D=0;z==0&&D<C;D++){var E=A[D]||\"\",F=B[D]||\"\",G=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),H=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var I=G.exec(E)||[\"\",\"\",\"\"],J=H.exec(F)||[\"\",\"\",\"\"];if(I[0].length==0&&J[0].length==0)break;z=i(I[1].length==0?0:parseInt(I[1],10),J[1].length==0?0:parseInt(J[1],10))||i(I[2].length==0,J[2].length==0)||i(I[2],",
L"J[2])}while(z==0)}y[\"522\"]=z>=0};",
L"function K(a,b){if(f(a.hasAttribute)==\"function\")if(a.hasAttribute(b))return true;var c=a.attributes,d=f(c);if(d==\"array\"||d==\"object\"&&typeof c.length==\"number\")if(a.attributes[b]||a.attributes[b]==false)return true;return b in a}var L=[\"checked\",\"disabled\",\"readOnly\",\"selected\"],M={checked:[\"INPUT\"],disabled:[\"INPUT\"],readOnly:[\"INPUT\"],selected:[\"INPUT\",\"OPTION\"]};",
L"function N(a,b){var c=b.toLowerCase(),d=null;d=M[b];if(h(L,b)>=0&&h(d,a.tagName)>=0){if(!K(a,b))return false;d=a[b];return!!(d&&d!=\"false\")}if(\"style\"==c)return\"\";if(\"class\"==c)b=\"className\";if(\"readonly\"==c)b=\"readOnly\";if(!K(a,b))return null;return d=a.getAttribute(b)!=null?a.getAttribute(b):a[b]};function O(a){if(K(a,\"checked\"))return N(a,\"checked\");if(K(a,\"selected\"))return N(a,\"selected\");throw Error(\"Element has neither checked nor selected attributes\");}var P=\"_\".split(\".\"),Q=e;!(P[0]in Q)&&Q.execScript&&Q.execScript(\"var \"+P[0]);for(var R;P.length&&(R=P.shift());)if(!P.length&&O!==undefined)Q[R]=O;else Q=Q[R]?Q[R]:Q[R]={};; return _.apply(null,arguments);};",
NULL
};

#endif

