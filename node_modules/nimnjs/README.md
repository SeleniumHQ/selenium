# nimnjs-node
JS implementation of nimn specification. Highly Compressed JS object/JSON. 60% or more compressed than JSON, 40% or more compressed than msgpack

[![Known Vulnerabilities](https://snyk.io/test/github/nimndata/nimnjs-node//badge.svg)](https://snyk.io/test/github/nimndata/nimnjs-node/) 
[![Travis ci Build Status](https://travis-ci.org/nimndata/nimnjs-node.svg?branch=master)](https://travis-ci.org/nimndata/nimnjs-node/) 
[![Coverage Status](https://coveralls.io/repos/github/nimndata/nimnjs-node/badge.svg?branch=master)](https://coveralls.io/github/nimndata/nimnjs-node/?branch=master)
[<img src="https://img.shields.io/badge/Try-me-blue.svg?colorA=FFA500&colorB=0000FF" alt="Try me"/>](https://nimndata.github.io/nimnjs-node/)

<a href="https://www.patreon.com/bePatron?u=9531404" data-patreon-widget-type="become-patron-button"><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron!" width="200" /></a>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC"> <img src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="Stubmatic donate button"/></a>

<img align="right" src="static/img/nimnjs-logo.png" /> 

## Introduction
NIMN JS can parse JS object to nimn data and vice versa. See Nimn [specification](https://github.com/nimndata/spec) for more detail.

## Usages
First install or add to your npm package
```
$npm install nimnjs
```

```js
var nimn = require("nimnjs");

var schema = {
    "name": "string",
    "age": "number",
    "human": "boolean",
    "projects": [{
        "name": "string",
        "decription": "string"
    }]
}

var nimnInstance = new nimn();
nimnInstance.addSchema(schema);

var data = {
    "name" : "amit",
    "age" : 32,
    "human" : true,
    "projects" : [
        {
            "name": "some",
            "decription" : "some long description"
        }
    ]
}

var result = nimnInstance.encode(data);//Æamitº32ÙÇÆsomeºsome long description
result = nimnInstance.decode(result);
expect(result).toEqual(data); 
```

For date compression
```js
var nimnDateparser = require("nimn-date-parser");
//generate schema and data
var nimnInstance = new nimn();
nimnInstance.addDataHandler("date",function(val){
    return nimnDateparser.parse(val,true,true,true)
},function(val){
    return nimnDateparser.parseBack(val,true,true,true)
});
nimnInstance.addSchema(schema); //add after adding all data handlers

var nimndata = nimnInstance.encode(data);
```


Encode enum type
```js
var nimnInstance = new nimn();
nimnInstance.addDataHandler("status",null,null,{
    "M" : "Married",
    "S" : "Single"
});
nimnInstance.addSchema(schema); //add after adding all data handlers
```

Just mark a data type
```js
var nimnInstance = new nimn();
nimnInstance.addDataHandler("image");
nimnInstance.addSchema(schema); //add after adding all data handlers
```


Include [dist](dist/nimn.js) in your HTML to use it in browser.


Check the [demo](https://nimndata.github.io/nimnjs-node/) for instant use. It generates schema automatically with the help of [schema builder](https://github.com/nimndata/nimnjs-schema-builder) when sample json is provided.


## Support
I need your expert advice, and contribution to grow nimn (निम्न) so that it can support all mazor languages. Please join the [official organization](https://github.com/nimndata) on github to support it. And ask your friends, and colleagues to give it a try. It can not only save bandwidth but speed up communication, search and much more.


### Worth to mention

- **[imglab](https://github.com/NaturalIntelligence/imglab)** : Web based tool to label images for object. So that they can be used to train dlib or other object detectors. You can integrate 3rd party libraries for fast labeling.
- **[अनुमार्गक (anumargak)](https://github.com/NaturalIntelligence/anumargak)** : The fastest router for node web servers.

 - [Stubmatic](https://github.com/NaturalIntelligence/Stubmatic) : A stub server to mock behaviour of HTTP(s) / REST / SOAP services.
 - **[fastify-xml-body-parser](https://github.com/NaturalIntelligence/fastify-xml-body-parser/)** : Fastify plugin / module to parse XML payload / body into JS object using fast-xml-parser.
  - [fast-lorem-ipsum](https://github.com/amitguptagwl/fast-lorem-ipsum) : Generate lorem ipsum words, sentences, paragraph very quickly.
- [Grapes](https://github.com/amitguptagwl/grapes) : Flexible Regular expression engine which can be applied on char stream. (under development)
- [fast XML Parser](https://github.com/amitguptagwl/fast-xml-parser) : Fastest pure js XML parser for xml to js/json and vice versa. And XML validation.
