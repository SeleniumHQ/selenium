var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://php-formatters/content/formats/php-base.js', this);

this.name = "php-phpunit";

function set(name, value) {
    switch(name) {
        case 'setTimeout':
            return '$this->' + name + '(' + value + ')';
        default:
            return '$this->' + name + '("' + value + '")';
    }
}

Equals.prototype.verify = function() {
    if (this.e2.toString().indexOf("getText") != -1) {
        return verifyText(this.e1.toString(), this.e2.toString());
    }
    return verify(this.assert());
};

function verifyText(want, got) {
    return '$this->verifyText("' + got.slice(got.indexOf('"') +1, got.lastIndexOf('"')) + '", ' + want + '")';
}

function verifyTrue(expression) {
    if (expression.toString().indexOf("isTextPresent") != -1) {
        return verifyTextPresent(expression);
    }
    return verify(assertTrue(expression));
}

function verifyTextPresent(expression) {
    e = expression.toString();
    return  '$this->verifyTextPresent("' + e.slice(e.indexOf('"') +1, e.lastIndexOf('"')) + '");';
}

options.header =
    '<?php\n' +
    'class Example extends PHPUnit_Extensions_SeleniumTestCase\n' +
    '{\n' +
    indents(1) + 'protected function setUp()\n' +
    indents(1) + '{\n' +
    indents(2) + '${receiver}->setBrowser("${environment}");\n' +
    indents(2) + '${receiver}->setBrowserUrl("${baseURL}");\n' +
    indents(1) + '}\n' +
    '\n' +
    indents(1) + 'public function testMyTestCase()\n' +
    indents(1) + '{\n';

options.footer =
    indents(1) + '}\n' +
    '}\n' +
    "?>";