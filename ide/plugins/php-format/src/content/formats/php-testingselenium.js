var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://php-formatters/content/formats/php-base.js', this);

this.name = "php-testing_selenium";

function set(name, value) {
    switch(name) {
        case 'setSomethingThatRequiresAndInteger':
            return '$this->' + name + '(' + value + ')';
        default:
            return '$this->' + name + '("' + value + '")';
    }
}

function verifyTrue(expression) {
    return verify(assertTrue(expression));
}

options.header =
    '<?php\n' +
    '\n' +
    "require_once 'Testing/Selenium.php';\n" +
    '\n' +
    'class Example extends PHPUnit_Framework_TestCase\n' +
    '{\n' +
    indents(1) + 'protected function setUp()\n' +
    indents(1) + '{\n' +
    indents(2) + '${receiver} = new Testing_Selenium("${environment}", "${baseURL}")\n';
    indents(1) + '}\n' +
    '\n' +
    indents(1) + 'public function testMyTestCase()\n' +
    indents(1) + '{\n';

options.footer =
    indents(1) + '}\n' +
    '}\n' +
    "?>";