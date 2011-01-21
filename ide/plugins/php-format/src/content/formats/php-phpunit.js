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

options.header =
    '<?php\n' +
    '\n' +
    "require_once 'PHPUnit/Extensions/SeleniumTestCase.php';\n" +
    '\n' +
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