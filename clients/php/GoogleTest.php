<?php

set_include_path(get_include_path() . PATH_SEPARATOR . './PEAR/');
require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';

class GoogleTest extends PHPUnit_Framework_TestCase
{
    private $selenium;

    public function setUp()
    {
        $this->selenium = new Testing_Selenium("*firefox", "http://www.google.com");
        $this->selenium->start();
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
