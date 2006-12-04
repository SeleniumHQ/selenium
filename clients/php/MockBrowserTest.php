<?php

// To run this test, You need to install PHPUnit and Selenium RC Server
// Selenium RC Server is available the following website.
// http://openqa.org/selenium-rc/
//error_reporting(E_ALL|E_STRICT);
set_include_path(get_include_path() . PATH_SEPARATOR . './PEAR/');
require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';

class MockBrowserTest extends PHPUnit_Framework_TestCase
{
    private $selenium;

    public function __construct($name)
    {
        $this->browserUrl = "http://x";
        parent::__construct($name);
    }
// {{{ setUp and tearDown
    public function setUp()
    {
        try {
            $this->selenium = new Testing_Selenium("*mock", $this->browserUrl);
            $this->selenium->start();
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }

    public function tearDown()
    {
        $this->selenium->stop();
    }

    public function testMock()
    {
        $this->selenium->open("/");
        $this->selenium->click("foo");
        $this->assertEquals("x", $this->selenium->getTitle());
        $this->assertTrue($this->selenium->isAlertPresent());
        $this->assertEquals(array(""), $this->selenium->getAllButtons());
        $this->assertEquals(array("1"), $this->selenium->getAllLinks());
        $this->assertEquals(array("1", "2", "3"), $this->selenium->getAllFields());
    }

}
?>
