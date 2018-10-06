var fs = require("fs"),
    libxmljs = require("libxmljs"),
    test = require("tap").test;

var addrs = require("../lib/email-addresses");

var TESTS_FILE = "tests.xml",
    TESTS_FILE_ENCODING = "utf8";

var ISEMAIL_ERR = "ISEMAIL_ERR",
    ISEMAIL_ERR_DOMAINHYPHENSTART = "ISEMAIL_ERR_DOMAINHYPHENSTART",
    ISEMAIL_ERR_DOMAINHYPHENEND = "ISEMAIL_ERR_DOMAINHYPHENEND";


function isEmailTest(t, data) {
    var nodes = getNodes(data, "//test");
    nodes.forEach(function (node) {
        var id = getAttr(node, "id"),
            address = getChildValue(node, "address"),
            diagnosis = getChildValue(node, "diagnosis");

        var result = addrs(convertAddress(address)),
            ast = null;
        if (result !== null) {
            ast = result.addresses[0].node;
        }

        var isValid = ast !== null,
            expectedToBeValid = shouldParse(diagnosis);

        t.equal(isValid, expectedToBeValid,
            "[test " + id + "] address: " + address + ", expects: " + expectedToBeValid);
    });
    t.end();
}

function shouldParse(diagnosis) {
    var isOk = !startsWith(diagnosis, ISEMAIL_ERR) ||
        // is_email considers address with a domain beginning
        // or ending with "-" to be incorrect because they are not
        // valid domains, but we are only concerned with rfc5322.
        // From rfc5322's perspective, this is OK.
        diagnosis === ISEMAIL_ERR_DOMAINHYPHENSTART ||
        diagnosis === ISEMAIL_ERR_DOMAINHYPHENEND;
    return isOk;
}

// the is_email tests encode control characters
// in the U+2400 block for display purposes
function convertAddress(s) {
    var chars = [];
    for (var i = 0; i < s.length; i += 1) {
        var code = s.charCodeAt(i);
        if (code >= 0x2400) {
            code -= 0x2400;
        }
        chars.push(String.fromCharCode(code));
    }
    return chars.join('');
}

function getChildValue(parent, nodeName) {
    return parent.find(nodeName)[0].text();
}

function getAttr(node, attrName) {
    return node.attr(attrName).value();
}

function getNodes(xml, xpath) {
    var doc = libxmljs.parseXml(xml);
    return doc.find(xpath);
}

function startsWith(s, t) {
    return s.substring(0, t.length) === t;
}

test("isemail tests", function (t) {
    fs.readFile(TESTS_FILE, TESTS_FILE_ENCODING, function (err, data) {
        if (err) {
            t.end();
            return console.error(err);
        }
        isEmailTest(t, data);
    });
});
