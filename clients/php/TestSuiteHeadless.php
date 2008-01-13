<?php
if (!defined('PHPUnit_MAIN_METHOD')) {
    define('PHPUnit_MAIN_METHOD', 'TestSuiteHeadless::main');
}
 
require_once 'PHPUnit/Framework.php';
require_once 'PHPUnit/TextUI/TestRunner.php';
 
require_once 'MockBrowserTest.php';
 
class TestSuiteHeadless
{
    public static function main()
    {
        PHPUnit_TextUI_TestRunner::run(self::suite());
    }
 
    public static function suite()
    {
        $suite = new PHPUnit_Framework_TestSuite('PHPUnit Framework');
 
        $suite->addTestSuite('MockBrowserTest');
 
        return $suite;
    }
}
 
if (PHPUnit_MAIN_METHOD == 'Framework_AllTests::main') {
    Framework_AllTests::main();
}
?>
