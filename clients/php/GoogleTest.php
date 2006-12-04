<?php

// To run this test, You need to install PHPUnit and Selenium RC Server
// Selenium RC Server is available the following website.
// http://openqa.org/selenium-rc/
//error_reporting(E_ALL|E_STRICT);
set_include_path(get_include_path() . PATH_SEPARATOR . './PEAR/');
require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';

class GoogleTest extends PHPUnit_Framework_TestCase
{
    private $selenium;

    public function __construct($name)
    {
        $this->browserUrl = "http://www.google.com";
        parent::__construct($name);
    }
// {{{ setUp and tearDown
    public function setUp()
    {
        try {
            $this->selenium = new Testing_Selenium("*firefox", $this->browserUrl);
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

    public function testGoogle()
    {
        $this->selenium->open("/");
        $this->selenium->type("q", "hello world");
        $this->selenium->click("btnG");
        $this->selenium->waitForPageToLoad(10000);
        $this->assertRegExp("/Google Search/", $this->selenium->getTitle());
    }

}
?>
