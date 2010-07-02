/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef GET_ATTRIBUTE_H
#define GET_ATTRIBUTE_H

const wchar_t* GET_ATTRIBUTE[] = {
L"var getAttribute=function(){var d=this;",
L"function e(a){var c=typeof a;if(c==\"object\")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)==\"[object Array]\"||typeof a.length==\"number\"&&typeof a.splice!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"splice\"))return\"array\";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)==\"[object Function]\"||typeof a.call!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"call\")))return\"function\"}else return\"null\";else if(c==",
L"\"function\"&&typeof a.call==\"undefined\")return\"object\";return c};",
L"var f=Array.prototype,g=f.indexOf?function(a,c,b){return f.indexOf.call(a,c,b)}:function(a,c,b){for(b=b==null?0:b<0?Math.max(0,a.length+b):b;b<a.length;b++)if(b in a&&a[b]===c)return b;return-1};function h(a,c){if(a<c)return-1;else if(a>c)return 1;return 0}(Date.now||function(){return+new Date})();var i,j,k,l;function m(){return d.navigator?d.navigator.userAgent:null}l=k=j=i=false;var n;if(n=m()){var o=d.navigator;i=n.indexOf(\"Opera\")==0;j=!i&&n.indexOf(\"MSIE\")!=-1;k=!i&&n.indexOf(\"WebKit\")!=-1;l=!i&&!k&&o.product==\"Gecko\"}var p=j,q=l,r=k,s,t=\"\",u;if(i&&d.opera){var v=d.opera.version;t=typeof v==\"function\"?v():v}else{if(q)u=/rv\\:([^\\);]+)(\\)|;)/;else if(p)u=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(r)u=/WebKit\\/(\\S+)/;if(u){var w=u.exec(m());t=w?w[1]:\"\"}}s=t;var x={};if(r)if(!x[\"522\"]){var y=0,z=String(s).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),A=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),B=Math.max(z.length,A.length);for(var C=0;y==0&&C<B;C++){var D=z[C]||\"\",E=A[C]||\"\",F=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),G=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var H=F.exec(D)||[\"\",\"\",\"\"],I=G.exec(E)||[\"\",\"\",\"\"];if(H[0].length==0&&I[0].length==0)break;y=h(H[1].length==0?0:parseInt(H[1],10),I[1].length==0?0:parseInt(I[1],10))||h(H[2].length==0,I[2].length==0)||h(H[2],",
L"I[2])}while(y==0)}x[\"522\"]=y>=0};",
L"var J=[\"checked\",\"disabled\",\"readOnly\",\"selected\"];function K(a,c){if(8==a.nodeType)return null;var b=c.toLowerCase();if(\"style\"==b)return\"\";if(\"readonly\"==b)c=\"readOnly\";b=null;if(e(a.hasAttribute)==\"function\")b=a.getAttribute(c);else{b=a.attributes[c];if(b!==undefined)b=b.value}if(b==null)return null;if(g(J,c)>=0)b=!!b&&b!=\"false\";return b}var L=\"_\".split(\".\"),M=d;!(L[0]in M)&&M.execScript&&M.execScript(\"var \"+L[0]);for(var N;L.length&&(N=L.shift());)if(!L.length&&K!==undefined)M[N]=K;else M=M[N]?M[N]:M[N]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef GET_PROPERTY_H
#define GET_PROPERTY_H

const wchar_t* GET_PROPERTY[] = {
L"var getProperty=function(){var a=this;",
L"function b(j,d){if(j<d)return-1;else if(j>d)return 1;return 0}(Date.now||function(){return+new Date})();var c,e,f,g;function h(){return a.navigator?a.navigator.userAgent:null}g=f=e=c=false;var i;if(i=h()){var k=a.navigator;c=i.indexOf(\"Opera\")==0;e=!c&&i.indexOf(\"MSIE\")!=-1;f=!c&&i.indexOf(\"WebKit\")!=-1;g=!c&&!f&&k.product==\"Gecko\"}var l=e,m=g,n=f,o,p=\"\",q;if(c&&a.opera){var r=a.opera.version;p=typeof r==\"function\"?r():r}else{if(m)q=/rv\\:([^\\);]+)(\\)|;)/;else if(l)q=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(n)q=/WebKit\\/(\\S+)/;if(q){var s=q.exec(h());p=s?s[1]:\"\"}}o=p;var t={};if(n)if(!t[\"522\"]){var u=0,v=String(o).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),w=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),x=Math.max(v.length,w.length);for(var y=0;u==0&&y<x;y++){var z=v[y]||\"\",A=w[y]||\"\",B=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),C=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var D=B.exec(z)||[\"\",\"\",\"\"],E=C.exec(A)||[\"\",\"\",\"\"];if(D[0].length==0&&E[0].length==0)break;u=b(D[1].length==0?0:parseInt(D[1],10),E[1].length==0?0:parseInt(E[1],10))||b(D[2].length==0,E[2].length==0)||b(D[2],",
L"E[2])}while(u==0)}t[\"522\"]=u>=0};",
L"var F={\"class\":\"className\",readonly:\"readOnly\"};function G(j,d){return j[F[d]||d]}var H=\"_\".split(\".\"),I=a;!(H[0]in I)&&I.execScript&&I.execScript(\"var \"+H[0]);for(var J;H.length&&(J=H.shift());)if(!H.length&&G!==undefined)I[J]=G;else I=I[J]?I[J]:I[J]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef HAS_ATTRIBUTE_H
#define HAS_ATTRIBUTE_H

const wchar_t* HAS_ATTRIBUTE[] = {
L"var hasAttribute=function(){var d=this;",
L"function e(a){var c=typeof a;if(c==\"object\")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)==\"[object Array]\"||typeof a.length==\"number\"&&typeof a.splice!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"splice\"))return\"array\";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)==\"[object Function]\"||typeof a.call!=\"undefined\"&&typeof a.propertyIsEnumerable!=\"undefined\"&&!a.propertyIsEnumerable(\"call\")))return\"function\"}else return\"null\";else if(c==",
L"\"function\"&&typeof a.call==\"undefined\")return\"object\";return c};",
L"var f=Array.prototype,g=f.indexOf?function(a,c,b){return f.indexOf.call(a,c,b)}:function(a,c,b){for(b=b==null?0:b<0?Math.max(0,a.length+b):b;b<a.length;b++)if(b in a&&a[b]===c)return b;return-1};function h(a,c){if(a<c)return-1;else if(a>c)return 1;return 0}(Date.now||function(){return+new Date})();var i,j,k,l;function m(){return d.navigator?d.navigator.userAgent:null}l=k=j=i=false;var n;if(n=m()){var o=d.navigator;i=n.indexOf(\"Opera\")==0;j=!i&&n.indexOf(\"MSIE\")!=-1;k=!i&&n.indexOf(\"WebKit\")!=-1;l=!i&&!k&&o.product==\"Gecko\"}var p=j,q=l,r=k,s,t=\"\",u;if(i&&d.opera){var v=d.opera.version;t=typeof v==\"function\"?v():v}else{if(q)u=/rv\\:([^\\);]+)(\\)|;)/;else if(p)u=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(r)u=/WebKit\\/(\\S+)/;if(u){var w=u.exec(m());t=w?w[1]:\"\"}}s=t;var x={};if(r)if(!x[\"522\"]){var y=0,z=String(s).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),A=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),B=Math.max(z.length,A.length);for(var C=0;y==0&&C<B;C++){var D=z[C]||\"\",E=A[C]||\"\",F=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),G=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var H=F.exec(D)||[\"\",\"\",\"\"],I=G.exec(E)||[\"\",\"\",\"\"];if(H[0].length==0&&I[0].length==0)break;y=h(H[1].length==0?0:parseInt(H[1],10),I[1].length==0?0:parseInt(I[1],10))||h(H[2].length==0,I[2].length==0)||h(H[2],",
L"I[2])}while(y==0)}x[\"522\"]=y>=0};",
L"var J=[\"checked\",\"disabled\",\"readOnly\",\"selected\"];function K(a,c){if(8==a.nodeType)return null;var b=c.toLowerCase();if(\"style\"==b)return\"\";if(\"readonly\"==b)c=\"readOnly\";b=null;if(e(a.hasAttribute)==\"function\")b=a.getAttribute(c);else{b=a.attributes[c];if(b!==undefined)b=b.value}if(b==null)return null;if(g(J,c)>=0)b=!!b&&b!=\"false\";return b};function L(a,c){return K(a,c)!==null}var M=\"_\".split(\".\"),N=d;!(M[0]in N)&&N.execScript&&N.execScript(\"var \"+M[0]);for(var O;M.length&&(O=M.shift());)if(!M.length&&L!==undefined)N[O]=L;else N=N[O]?N[O]:N[O]={};; return _.apply(null,arguments);};",
NULL
};

#endif

/* AUTO GENERATED - Do not edit by hand. */
/* See rake-tasts/crazy_fun/mappings/javascript.rb for generator. */

#ifndef HAS_PROPERTY_H
#define HAS_PROPERTY_H

const wchar_t* HAS_PROPERTY[] = {
L"var hasProperty=function(){var a=this;",
L"function b(j,d){if(j<d)return-1;else if(j>d)return 1;return 0}(Date.now||function(){return+new Date})();var c,e,f,g;function h(){return a.navigator?a.navigator.userAgent:null}g=f=e=c=false;var i;if(i=h()){var k=a.navigator;c=i.indexOf(\"Opera\")==0;e=!c&&i.indexOf(\"MSIE\")!=-1;f=!c&&i.indexOf(\"WebKit\")!=-1;g=!c&&!f&&k.product==\"Gecko\"}var l=e,m=g,n=f,o,p=\"\",q;if(c&&a.opera){var r=a.opera.version;p=typeof r==\"function\"?r():r}else{if(m)q=/rv\\:([^\\);]+)(\\)|;)/;else if(l)q=/MSIE\\s+([^\\);]+)(\\)|;)/;else if(n)q=/WebKit\\/(\\S+)/;if(q){var s=q.exec(h());p=s?s[1]:\"\"}}o=p;var t={};if(n)if(!t[\"522\"]){var u=0,v=String(o).replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),w=String(\"522\").replace(/^[\\s\\xa0]+|[\\s\\xa0]+$/g,\"\").split(\".\"),x=Math.max(v.length,w.length);for(var y=0;u==0&&y<x;y++){var z=v[y]||\"\",A=w[y]||\"\",B=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\"),C=RegExp(\"(\\\\d*)(\\\\D*)\",\"g\");do{var D=B.exec(z)||[\"\",\"\",\"\"],E=C.exec(A)||[\"\",\"\",\"\"];if(D[0].length==0&&E[0].length==0)break;u=b(D[1].length==0?0:parseInt(D[1],10),E[1].length==0?0:parseInt(E[1],10))||b(D[2].length==0,E[2].length==0)||b(D[2],",
L"E[2])}while(u==0)}t[\"522\"]=u>=0};",
L"var F={\"class\":\"className\",readonly:\"readOnly\"};function G(j,d){return j[F[d]||d]!==null}var H=\"_\".split(\".\"),I=a;!(H[0]in I)&&I.execScript&&I.execScript(\"var \"+H[0]);for(var J;H.length&&(J=H.shift());)if(!H.length&&G!==undefined)I[J]=G;else I=I[J]?I[J]:I[J]={};; return _.apply(null,arguments);};",
NULL
};

#endif

