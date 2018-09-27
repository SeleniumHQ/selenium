# [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser)
Validate XML, Parse XML to JS/JSON and vice versa, or parse XML to Nimn rapidly without C/C++ based libraries and no callback

> This project welcomes **contributors**. If you have a feature you'd like to see implemented or a bug you'd liked fixed, the best and fastest way to make that happen is to implement it and submit a PR. Basic knowledge of JS is sufficient. Feel free to ask for any guidance.

> If you want to join this project as collaborator / maintainer please let me know, the only condition is to be polite with the users.


[![Backers on Open Collective](https://opencollective.com/fast-xml-parser/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/fast-xml-parser/sponsors/badge.svg)](#sponsors) [![Known Vulnerabilities](https://snyk.io/test/github/naturalintelligence/fast-xml-parser/badge.svg)](https://snyk.io/test/github/naturalintelligence/fast-xml-parser)
[![NPM quality][quality-image]][quality-url]
[![Travis ci Build Status](https://travis-ci.org/NaturalIntelligence/fast-xml-parser.svg?branch=master)](https://travis-ci.org/NaturalIntelligence/fast-xml-parser)
[![Coverage Status](https://coveralls.io/repos/github/NaturalIntelligence/fast-xml-parser/badge.svg?branch=master)](https://coveralls.io/github/NaturalIntelligence/fast-xml-parser?branch=master)
[<img src="https://img.shields.io/badge/Try-me-blue.svg?colorA=FFA500&colorB=0000FF" alt="Try me"/>](https://naturalintelligence.github.io/fast-xml-parser/)
[![bitHound Dev Dependencies](https://www.bithound.io/github/NaturalIntelligence/fast-xml-parser/badges/devDependencies.svg)](https://www.bithound.io/github/NaturalIntelligence/fast-xml-parser/master/dependencies/npm)
[![bitHound Overall Score](https://www.bithound.io/github/NaturalIntelligence/fast-xml-parser/badges/score.svg)](https://www.bithound.io/github/NaturalIntelligence/fast-xml-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/fast-xml-parser.svg)](https://npm.im/fast-xml-parser)

[quality-image]: http://npm.packagequality.com/shield/fast-xml-parser.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=fast-xml-parser

<a href="https://opencollective.com/fast-xml-parser/donate" target="_blank">
  <img src="https://opencollective.com/fast-xml-parser/donate/button@2x.png?color=blue" width=200 />
</a>
<a href="https://www.patreon.com/bePatron?u=9531404" data-patreon-widget-type="become-patron-button"><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron!" width="200" /></a>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC"> <img src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="Stubmatic donate button"/></a>

### Main Features

<img align="right" src="static/img/fxp_logo.png" width="180px" alt="FXP logo"/>

* Validate XML data syntactically
* Transform XML to JSON or Nimn
* Transform JSON back to XML
* Works with node packages, in browser, and in CLI (press try me button above for demo)
* Faster than any pure JS implementation.
* It can handle big files (tested up to 100mb).
* Various options are available to customize the transformation
    * You can parse CDATA as separate property.
    * You can prefix attributes or group them to separate property. Or can ignore them from result completely.
    * You can parse tag's or attribute's value to primitive type: string, integer, float, hexadecimal, or boolean. And can optionally decode for HTML char.
    * You can remove namespace from tag or attribute name while parsing
    * It supports boolean attributes, if configured.



## How to use

To use it in **NPM package**  install it first

`$npm install fast-xml-parser` or using [yarn](https://yarnpkg.com/) `$yarn add fast-xml-parser`

To use it from **CLI** Install it globally with `-g` option.

`$npm install fast-xml-parser -g`

To use it on a **webpage** include it from [parser.js](https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/lib/parser.js) or directly from [CDN](https://cdnjs.com/libraries/fast-xml-parser)

### XML to JSON


```js
var jsonObj = parser.parse(xmlData [,options] );
```

```js
var parser = require('fast-xml-parser');
var he = require('he');

var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
    attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : a => he.decode(a) //default is a=>a
};
if(fastXmlParser.validate(xmlData)=== true){//optional
	var jsonObj = fastXmlParser.parse(xmlData,options);
}

//Intermediate obj
var tObj = fastXmlParser.getTraversalObj(xmlData,options);
var jsonObj = fastXmlParser.convertToJson(tObj,options);

```
#### Note: [he](https://www.npmjs.com/package/he) library is used in this example

### XML to Nimn
```js
var nimnData = parser.parse(xmlData, schema [,options] );


//Intermediate obj
var tObj = fastXmlParser.getTraversalObj(xmlData,options);
var jsonObj = fastXmlParser.convertToJson(tObj,options);

//construct schema manually or with the help of schema builder
var nimndata = fastXmlParser.convertTonimn(tObj,schema,options);
```
* [NIMN (निम्न)](https://github.com/nimndata/spec) reduces size of the data by 80%.
* Check [nimnjs](https://github.com/nimndata/nimnjs-node) to know more about schema, json to nimndata and reverse transformation.

<details>
	<summary>OPTIONS :</summary>

* **attributeNamePrefix** : prepend given string to attribute name for identification
* **attrNodeName**: (Valid name) Group all the attributes as properties of given name.
* **ignoreAttributes** : Ignore attributes to be parsed.
* **ignoreNameSpace** : Remove namespace string from tag and attribute names.
* **allowBooleanAttributes** : a tag can have attributes without any value
* **parseNodeValue** : Parse the value of text node to float, integer, or boolean.
* **parseAttributeValue** : Parse the value of an attribute to float, integer, or boolean.
* **trimValues** : trim string values of an attribute or node
* **decodeHTMLchar** : This options has been removed from 3.3.4. Instead, use tagValueProcessor, and attrValueProcessor. See above example.
* **cdataTagName** : If specified, parser parse CDATA as nested tag instead of adding it's value to parent tag.
* **cdataPositionChar** : It'll help to covert JSON back to XML without losing CDATA position.
* **localeRange**: Parser will accept non-English character in tag or attribute name. Check #87 for more detail. Eg `localeRange: "a-zA-Zа-яёА-ЯЁ"`
* **parseTrueNumberOnly**: if true then values like "+123", or "0123" will not be parsed as number.
* **tagValueProcessor** : Process tag value during transformation. Like HTML decoding, word capitalization, etc. Applicable in case of string only.
* **attrValueProcessor** : Process attribute value during transformation. Like HTML decoding, word capitalization, etc. Applicable in case of string only.

</details>

<details>
	<summary>To use from <b>command line</b></summary>

```bash
$xml2js [-ns|-a|-c|-v|-V] <filename> [-o outputfile.json]
$cat xmlfile.xml | xml2js [-ns|-a|-c|-v|-V] [-o outputfile.json]
```

* -ns : To include namespaces (by default ignored)
* -a : To ignore attributes
* -c : To ignore value conversion (i.e. "-3" will not be converted to number -3)
* -v : validate before parsing
* -V : only validate
</details>


<details>
	<summary>To use it <b>on webpage</b></summary>

```js
var result = parser.validate(xmlData);
if(result !== true) console.log(result.err);
var jsonObj = parser.parse(xmlData);
```
</details>

### JSON / JS Object to XML

```js
var Parser = require("fast-xml-parser").j2xParser;
//default options need not to set
var defaultOptions = {
    attributeNamePrefix : "@_",
    attrNodeName: "@", //default is false
    textNodeName : "#text",
    ignoreAttributes : true,
    cdataTagName: "__cdata", //default is false
    cdataPositionChar: "\\c",
    format: false,
    indentBy: "  ",
    supressEmptyNode: false,
    tagValueProcessor: a=> he.encode(a, { useNamedReferences: true}),// default is a=>a
    attrValueProcessor: a=> he.encode(a, {isAttributeValue: isAttribute, useNamedReferences: true})// default is a=>a
};
var parser = new Parser(defaultOptions);
var xml = parser.parse(json_or_js_obj);

```

<details>
	<summary>OPTIONS :</summary>

With the correct options, you can get the almost original XML without losing any information.

* **attributeNamePrefix** : Identify attributes with this prefix otherwise treat them as a tag.
* **attrNodeName**: Identify attributes when they are grouped under single property.
* **ignoreAttributes** : Don't check for attributes. Treats everything as tag.
* **encodeHTMLchar** : This option has been removed from 3.3.4. Use tagValueProcessor, and attrValueProcessor instead. See above example.
* **cdataTagName** : If specified, parse matching tag as CDATA
* **cdataPositionChar** : Identify the position where CDATA tag should be placed. If it is blank then CDATA will be added in the last of tag's value.
* **format** : If set to true, then format the XML output.
* **indentBy** : indent by this char `when` format is set to `true`
* **supressEmptyNode** : If set to `true`, tags with no value (text or nested tags) are written as self closing tags.
* **tagValueProcessor** : Process tag value during transformation. Like HTML encoding, word capitalization, etc. Applicable in case of string only.
* **attrValueProcessor** : Process attribute value during transformation. Like HTML encoding, word capitalization, etc. Applicable in case of string only.
</details>

## Benchmark

#### XML to JSON

![npm_xml2json_compare](static/img/fxpv3-vs-xml2jsv0419_chart.png)

<details>
	<summary>report</summary>

| file size | fxp 3.0 validator (rps) | fxp 3.0 parser (rps) | xml2js 0.4.19 (rps) |
| ---------- | ----------------------- | ------------------- | ------------------- |
| 1.5k | 16581.06758 | 14032.09323 | 4615.930805 |
| 1.5m | 14918.47793 | 13.23366098 | 5.90682005 |
| 13m | 1.834479235 | 1.135582008 | -1 |
| 1.3k with CDATA | 30583.35319 | 43160.52342 | 8398.556349 |
| 1.3m with CDATA | 27.29266471 | 52.68877009 | 7.966000795 |
| 1.6k with cdata,prolog,doctype | 27690.26082 | 41433.98547 | 7872.399268 |
| 98m | 0.08473858148 | 0.2600104004 | -1 |

* -1 indicates error or incorrect output.
</details>


#### JSON to XML

![npm_xml2json_compare](static/img/j2x.png)

<details>
	<summary>report</summary>

| file size | fxp 3.2 js to xml | xml2js 0.4.19 builder |
|------------|-----------------|-----------------|
| 1.3k | 160148.9801 | 10384.99401|
| 1.1m | 173.6374831 | 8.611884025|

</details>

### Worth to mention

- **[निम्न (NIMN)](https://github.com/nimndata/spec)** : Save up to 85% network bandwidth and storage space.
- **[imglab](https://github.com/NaturalIntelligence/imglab)** : Speedup and simplify image labeling / annotation process online. Supports multiple formats, one click annotation, easy interface and much more.
- **[अनुमार्गक (anumargak)](https://github.com/NaturalIntelligence/anumargak)** : The fastest and simple router for node js web frameworks.
- [stubmatic](https://github.com/NaturalIntelligence/Stubmatic) : A stub server to mock behaviour of HTTP(s) / REST / SOAP services. You can also mock binary formats.
- [मुनीम (Muneem)](https://github.com/muneem4node/muneem) : A webframework made for all team members.
- [शब्दावली (shabdawali)](https://github.com/amitguptagwl/shabdawali) : Amazing human like typing effects beyond your imagination.


## Users
List of applications and projects using Fast XML Parser. (Raise an issue to submit yours)

<a href="https://github.com/NaturalIntelligence/imglab" title="imglab" ><img src="https://github.com/NaturalIntelligence/imglab/blob/master/img/imglab_logo.png?raw=true" width="80px" ></a>
<a href="https://github.com/NaturalIntelligence/Stubmatic" title="stubmatic" ><img src="https://camo.githubusercontent.com/ff711425dc2286cd215637b7114eb43e571f001d/68747470733a2f2f6e61747572616c696e74656c6c6967656e63652e6769746875622e696f2f537475626d617469632f696d672f737475626d617469635f6c6f676f2e706e673f7261773d74727565" width="80px" ></a>
<a href="https://github.com/muneem4node/muneem" title="Muneem" ><img src="https://github.com/muneem4node/muneem/raw/master/static/muneem.png?raw=true" width="80px" ></a>
<a href="https://github.com/badges/shields" title="shields" ><img src="https://avatars2.githubusercontent.com/u/6254238" width="80px" ></a>
<a href="https://github.com/renovatebot/renovate" title="renovate" ><img src="https://avatars1.githubusercontent.com/u/38656520" width="80px" ></a>
<a href="https://github.com/camunda" title="camunda BPM" > <img src="https://avatars3.githubusercontent.com/u/2443838" width="80px" ></a>
<a href="https://github.com/AnyChart" title="AnyChart" > <img src="https://avatars0.githubusercontent.com/u/703373" width="80px" ></a>
<a href="https://github.com/magda-io" title="magda-io" > <img src="https://avatars0.githubusercontent.com/u/40348684" width="80px" ></a>
<a href="https://github.com/geistinteractive" title="Geist Interactive" > <img src="https://avatars0.githubusercontent.com/u/11617965" width="80px" ></a>
<a href="https://www.tourstream.eu/" title="tourstream" > <img src="https://avatars1.githubusercontent.com/u/23242088" width="80px" ></a>
<a href="https://www.atomist.com/" title="Atomist" > <img src="https://avatars3.githubusercontent.com/u/19392" width="80px" ></a>
<a href="http://www.opuscapita.com/" title="OpusCapita" > <img src="https://avatars1.githubusercontent.com/u/23256480" width="80px" ></a>
<a href="https://nevatrip.ru/" title="nevatrip" > <img src="https://avatars2.githubusercontent.com/u/35730984" width="80px" ></a>
<a href="http://eosnavigator.com/" title="nevatrip" > <img src="https://avatars1.githubusercontent.com/u/40260563" width="80px" ></a>
<a href="http://pds.nasa.gov/" title="NASA-PDS" > <img src="https://avatars2.githubusercontent.com/u/26313833" width="80px" ></a>
<a href="http://qgis.org/" title="QGIS" > <img src="https://avatars2.githubusercontent.com/u/483444" width="80px" ></a>
<a href="http://www.craft.ai/" title="craft ai" > <img src="https://avatars1.githubusercontent.com/u/12046764" width="80px" ></a>
<a href="http://brownspace.org/" title="Brown Space Engineering" > <img src="https://avatars2.githubusercontent.com/u/5504507" width="80px" ></a>
<a href="http://www.appcelerator.com/" title="Team Appcelerator" > <img src="https://avatars1.githubusercontent.com/u/82188" width="80px" ></a>
<a href="http://orange-opensource.github.io/" title="Open Source by Orange" > <img src="https://avatars3.githubusercontent.com/u/1506386" width="80px" ></a>
<a href="http://www.ybrain.com/" title="YBRAIN Inc." > <img src="https://avatars2.githubusercontent.com/u/38232440" width="80px" ></a>
<a href="http://99bitcoins.com/" title="99 bitcoins" > <img src="https://avatars0.githubusercontent.com/u/9527779" width="80px" ></a>





## Contributors

This project exists thanks to [all](graphs/contributors) the people who contribute. [[Contribute](CONTRIBUTING.md)].
<!-- <a href="graphs/contributors"><img src="https://opencollective.com/fast-xml-parser/contributors.svg?width=890&button=false" /></a> -->
<!--
### Lead Maintainers
![Amit Gupta](https://avatars1.githubusercontent.com/u/7692328?s=100&v=4)
[![Vohmyanin Sergey Vasilevich](https://avatars3.githubusercontent.com/u/783335?s=100&v=4)](https://github.com/Delagen)

### All Contributors -->
<a href="graphs/contributors"><img src="https://opencollective.com/fast-xml-parser/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/fast-xml-parser#backer)]

<a href="https://opencollective.com/fast-xml-parser#backers" target="_blank"><img src="https://opencollective.com/fast-xml-parser/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/fast-xml-parser#sponsor)]

<a href="https://opencollective.com/fast-xml-parser/sponsor/0/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/1/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/2/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/3/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/4/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/5/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/6/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/7/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/8/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/fast-xml-parser/sponsor/9/website" target="_blank"><img src="https://opencollective.com/fast-xml-parser/sponsor/9/avatar.svg"></a>
