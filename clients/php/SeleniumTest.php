<?php

// To run this test, You need to install PHPUnit and Selenium RC Server
// Selenium RC Server is available the following website.
// http://openqa.org/selenium-rc/
//error_reporting(E_ALL|E_STRICT);
set_include_path(get_include_path() . PATH_SEPARATOR . './PEAR/');
require_once 'Testing/Selenium.php';
require_once 'PHPUnit/Framework/TestCase.php';

class SeleniumTest extends PHPUnit_Framework_TestCase
{
    private $selenium;

    public function __construct($name)
    {
        // The URL you are going to test
        // Please install tests the following URL or edit the URI
        // http://localhost/tests/
        // ganchiku.com is just for the initial testing.
        $this->browserUrl = "http://www.ganchiku.com/";
//        $this->browserUrl = "http://yourserver/";
        // The path for the tests
        $this->testUrl = $this->browserUrl . "selenium/tests";
        parent::__construct($name);
    }
// {{{ setUp and tearDown
    public function setUp()
    {
        try {
            $this->selenium = new Testing_Selenium("*firefox", $this->browserUrl);
            // XXX pear does not work E_STRICT because of HTTP_Request
            // the options are "curl", "pear", "native"
//            $this->selenium->setDriver("pear");
            $this->selenium->start();
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }

    public function tearDown()
    {
        try {
           $this->selenium->stop();
        } catch (Testing_Selenium_Exception $e) {
            echo $e;
        }
    }
    // }}}

    // {{{ testOpen
    public function testOpen()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_open.html");
            $this->assertEquals("{$this->testUrl}/html/test_open.html", $this->selenium->getLocation());
            $this->assertEquals("This is a test of the open command.", $this->selenium->getBodyText());

            $this->selenium->open("{$this->testUrl}/html/test_page.slow.html");
            $this->assertEquals("{$this->testUrl}/html/test_page.slow.html", $this->selenium->getLocation());
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
  /*
    // {{{ testClick
    public function testClick()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_click_page1.html");
            $this->assertEquals("Click here for next page", $this->selenium->getText("link"));
            $this->selenium->click("link");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page Target", $this->selenium->getTitle());
            $this->selenium->click("previousPage");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

            $this->selenium->click("linkWithEnclosedImage");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page Target", $this->selenium->getTitle());
            $this->selenium->click("previousPage");
            $this->selenium->waitForPageToLoad(500);

            $this->selenium->click("enclosedImage");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page Target", $this->selenium->getTitle());
            $this->selenium->click("previousPage");
            $this->selenium->waitForPageToLoad(500);

            $this->selenium->click("linkToAnchorOnThisPage");
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());
            $this->selenium->click("linkWithOnclickReturnsFalse");
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testClickJavaScriptHref
    public function testClickJavaScriptHref()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_click_javascript_page.html");
            $this->selenium->click("link");
            $this->assertTrue($this->selenium->isAlertPresent());
            $this->assertEquals("link clicked", $this->selenium->getAlert());

            $this->selenium->click("linkWithMultipleJavascriptStatements");
            $this->assertEquals("alert1", $this->selenium->getAlert());
            $this->assertEquals("alert2", $this->selenium->getAlert());
            $this->assertEquals("alert3", $this->selenium->getAlert());

            $this->selenium->click("linkWithJavascriptVoidHref");
            $this->assertEquals("onclick", $this->selenium->getAlert());
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

            $this->selenium->click("linkWithOnclickReturnsFalse");
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

            $this->selenium->click("enclosedImage");
            $this->assertEquals("enclosedImage clicked", $this->selenium->getAlert());
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testType
    public function testType()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_type_page1.html");
            $this->selenium->type("username", "TestUser");
            $this->assertEquals("TestUser", $this->selenium->getValue("username"));
            $this->selenium->type("password", "testUserPassword");
            $this->assertEquals("testUserPassword", $this->selenium->getValue("password"));

            $this->selenium->click("submitButton");
            $this->selenium->waitForPageToLoad(500);
            $this->assertRegExp("/Welcome, TestUser!/", $this->selenium->getText("//h2"));


        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
        
    }
    // }}}
    // {{{ testSelect
    public function testSelect()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_select.html");
            $this->assertEquals("Second Option", $this->selenium->getSelectedLabel("theSelect"));
            $this->assertEquals("option2", $this->selenium->getSelectedValue("theSelect"));

            $this->selenium->select("theSelect", "index=4");
            $this->assertEquals("Fifth Option", $this->selenium->getSelectedLabel("theSelect"));
            $this->assertEquals("o4", $this->selenium->getSelectedId("theSelect"));

            $this->selenium->select("theSelect", "Third Option");
            $this->assertEquals("Third Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "label=Fourth Option");
            $this->assertEquals("Fourth Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "value=option6");
            $this->assertEquals("Sixth Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "value=");
            $this->assertEquals("Empty Value Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "id=o4");
            $this->assertEquals("Fourth Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "");
            $this->assertEquals("", $this->selenium->getSelectedLabel("theSelect"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testMultiSelect
    public function testMultiSelect()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_multiselect.html");
            $this->assertEquals("Second Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->select("theSelect", "index=4");
            $this->assertEquals("Fifth Option", $this->selenium->getSelectedLabel("theSelect"));

            $this->selenium->addSelection("theSelect", "Third Option");
            $this->selenium->addSelection("theSelect", "value=");
            $this->assertTrue(in_array("Third Option", $this->selenium->getSelectedLabels("theSelect")));
            $this->assertTrue(in_array("Fifth Option", $this->selenium->getSelectedLabels("theSelect")));
            $this->assertTrue(in_array("Empty Value Option", $this->selenium->getSelectedLabels("theSelect")));
            $this->assertEquals(3, count($this->selenium->getSelectedLabels("theSelect")));

            $this->selenium->removeSelection("theSelect", "id=o7");
            $this->assertFalse(in_array("Empty Value Option", $this->selenium->getSelectedLabels("theSelect")));
            $this->assertEquals(2, count($this->selenium->getSelectedLabels("theSelect")));

            $this->selenium->removeSelection("theSelect", "label=Fifth Option");
            $this->assertFalse(in_array("Fifth Option", $this->selenium->getSelectedLabels("theSelect")));
            $this->assertEquals(1, count($this->selenium->getSelectedLabels("theSelect")));

            $this->selenium->addSelection("theSelect", "");
            $this->assertEquals(2, count($this->selenium->getSelectedLabels("theSelect")));


        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testSubmit
    public function testSubmit()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_submit.html");
            $this->selenium->submit("searchForm");
            $this->assertTrue($this->selenium->isAlertPresent());
            $this->assertEquals("onsubmit called", $this->selenium->getAlert());

            $this->selenium->check("okayToSubmit");
            $this->selenium->submit("searchForm");
            $this->assertEquals("onsubmit called", $this->selenium->getAlert());
            $this->assertEquals("form submitted", $this->selenium->getAlert());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testCheckUncheck
    public function testCheckUncheck()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_check_uncheck.html");
            $this->assertEquals("on", $this->selenium->getValue("base-spud"));
            $this->assertNotEquals("on", $this->selenium->getValue("base-rice"));
            $this->assertEquals("on", $this->selenium->getValue("option-cheese"));
            $this->assertNotEquals("on", $this->selenium->getValue("option-onions"));

            $this->selenium->check("base-rice");
            $this->assertNotEquals("on", $this->selenium->getValue("base-spud"));
            $this->assertEquals("on", $this->selenium->getValue("base-rice"));
            $this->selenium->uncheck("option-cheese");
            $this->assertEquals("off", $this->selenium->getValue("option-cheese"));
            $this->selenium->check("option-onions");
            $this->assertNotEquals("off", $this->selenium->getValue("option-onions"));

            $this->assertNotEquals("on", $this->selenium->getValue("option-chilli"));
            $this->selenium->check("option-chilli");
            $this->assertEquals("on", $this->selenium->getValue("option-chilli"));
            $this->selenium->uncheck("option index=3");
            $this->assertNotEquals("on", $this->selenium->getValue("option-chilli"));


        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testSelectWindow
    public function testSelectWidndow()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_select_window.html");
            $this->selenium->click("popupPage");
            $this->selenium->waitForPopUp("myPopupWindow", 1000);
            $this->selenium->selectWindow("myPopupWindow");
            $this->assertEquals("{$this->testUrl}/html/test_select_window_popup.html", $this->selenium->getLocation());
            $this->assertEquals("Select Window Popup", $this->selenium->getTitle());
            $this->selenium->close();
            $this->selenium->selectWindow("null");

            $this->assertEquals("{$this->testUrl}/html/test_select_window.html", $this->selenium->getLocation());
            $this->selenium->click("popupPage");
            $this->selenium->waitForPopUp("myNewWindow", 1000);
            $this->selenium->selectWindow("myNewWindow");
            $this->assertEquals("{$this->testUrl}/html/test_select_window_popup.html", $this->selenium->getLocation());
            $this->selenium->close();
            $this->selenium->selectWindow("null");

            $this->selenium->click("popupAnonymous");
            $this->selenium->waitForPopUp("anonymouspopup", 1000);
            $this->selenium->selectWindow("anonymouspopup");
            $this->assertEquals("{$this->testUrl}/html/test_select_window_popup.html", $this->selenium->getLocation());
            $this->selenium->click("closePage");

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }

    }
    // }}}
    // {{{ testStore NO USE
    //    public function testStore()
    //    {}
    // }}}
    // {{{ testJavaScriptParameters
    public function testJavaScriptParameters()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_store_value.html");
            $this->selenium->type("theText", "javascript{[1,2,3,4,5].join(':')}");
            $this->assertEquals("1:2:3:4:5", $this->selenium->getValue("theText"));

            $this->selenium->type("theText", "javascript{10 * 5}");
            $this->assertEquals("50", $this->selenium->getValue("theText"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testPause NO USE
    //    public function testPause()
    //{}
    // }}}
    // {{{ testWait
    public function testWait()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_reload_onchange_page.html");
            $this->selenium->select("theSelect", "Second Option");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());
            $this->selenium->goBack();
            $this->selenium->waitForPageToLoad(500);

            $this->selenium->type("theTextbox", "new value");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());

            $this->selenium->goBack();
            $this->selenium->waitForPageToLoad(500);

            $this->selenium->click("theSubmit");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());

            $this->selenium->click("slowPage_reload");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}

    // {{{ testWaitInPopupWindow
    public function testWaitInPopupWindow()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_select_window.html");
            $this->selenium->click("popupPage");
            $this->selenium->waitForPopUp("myPopupWindow", 500);
            $this->selenium->selectWindow("myPopupWindow");
            $this->assertEquals("Select Window Popup", $this->selenium->getTitle());

            $this->selenium->setTimeout(2000);
            $this->selenium->click("link=Click to load new page");
            // XXX NEED TO CHECK
            $this->selenium->waitForPageToLoad(2000);
            $this->assertEquals("Reload Page", $this->selenium->getTitle());

            $this->selenium->setTimeout(30000);
            $this->selenium->click("link=Click here");
            // XXX NEED TO CHECK
            $this->selenium->waitForPageToLoad(30000);
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());

            $this->selenium->close();
            $this->selenium->selectWindow("null");
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}

    // {{{ testWaitFor NOT USE
    //    public function testWaitFor()
    //    {}
    // }}}
    // {{{ testWaitForNot NOT USE
    //    public function testWaitForNot()
    //    {}
    // }}}
    // {{{ testVerification NO USE Maybe...
    // public function testVerification()
    //{}
    // }}}
    // {{{ testTextWhiteSpace NOT USE
    //public function testTextWhiteSpace()
    //{}
    // }}}
    // {{{ testPatternMatching NO USE
    // public function testPatternMatching()
    // {}
    // }}}
    // {{{ testLocators
    public function testLocators()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_locators.html");
            $this->assertEquals("this is the first element", $this->selenium->getText("id=id1"));
            $this->assertFalse($this->selenium->isElementPresent("id=name1"));
            $this->assertFalse($this->selenium->isElementPresent("id=id4"));
            $this->assertEquals("a1", $this->selenium->getAttribute("id=id1@class"));

            $this->assertEquals("this is the second element", $this->selenium->getText("name=name1"));
            $this->assertFalse($this->selenium->isElementPresent("name=id1"));
            $this->assertFalse($this->selenium->isElementPresent("name=notAName"));
            $this->assertEquals("a2", $this->selenium->getAttribute("name=name1@class"));

            $this->assertEquals("this is the first element", $this->selenium->getText("identifier=id1"));
            $this->assertFalse($this->selenium->isElementPresent("identifier=id4"));
            $this->assertEquals("a1", $this->selenium->getAttribute("identifier=id1@class"));
            $this->assertEquals("this is the second element", $this->selenium->getText("identifier=name1"));
            $this->assertEquals("a2", $this->selenium->getAttribute("identifier=name1@class"));

            $this->assertEquals("this is the second element", $this->selenium->getText("dom=document.links[1]"));
            $this->assertEquals("a2", $this->selenium->getAttribute("dom=document.links[1]@class"));
            $this->assertFalse($this->selenium->isElementPresent("dom=document.links[9]"));
            $this->assertFalse($this->selenium->isElementPresent("dom=foo"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testImplicitLocators
    public function testImplicitLocators()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_locators.html");
            $this->assertEquals("this is the first element", $this->selenium->getText("id1"));
            $this->assertEquals("a1", $this->selenium->getAttribute("id1@class"));

            $this->assertEquals("this is the second element", $this->selenium->getText("name1"));
            $this->assertEquals("a2", $this->selenium->getAttribute("name1@class"));

            $this->assertEquals("this is the second element", $this->selenium->getText("document.links[1]"));
            $this->assertEquals("a2", $this->selenium->getAttribute("document.links[1]@class"));

            $this->assertEquals("banner", $this->selenium->getText("//img[contains(@src, 'banner.gif')]/@alt"));
            $this->assertEquals("this is the second element", $this->selenium->getText("//body/a[2]"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testXPathLocators
    public function testXPathLocators()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_locators.html");
            $this->assertEquals("this is the first element", $this->selenium->getText("xpath=//a"));
            $this->assertEquals("this is the second element", $this->selenium->getText("xpath=//a[@class='a2']"));
            $this->assertEquals("this is the second element", $this->selenium->getText("xpath=//*[@class='a2']"));
            $this->assertEquals("this is the second element", $this->selenium->getText("xpath=//a[2]"));
            $this->assertFalse($this->selenium->isElementPresent("xpath=//a[@href='foo']"));

            $this->assertEquals("a1", $this->selenium->getAttribute("xpath=//a[contains(@href, '#id1')]/@class"));
            $this->assertTrue($this->selenium->isElementPresent("//a[text()='this is the second element']"));

            $this->assertEquals("this is the first element", $this->selenium->getText("xpath=//a"));
            $this->assertEquals("a1", $this->selenium->getAttribute("//a[contains(@href, '#id1')]/@class"));

            $this->assertEquals("theCellText", $this->selenium->getText("xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td"));

            $this->selenium->click("//input[@name='name2' and @value='yes']");

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testGoBack
    public function testGoBack()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_click_page1.html");
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

            $this->selenium->click("link");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page Target", $this->selenium->getTitle());

            $this->selenium->goBack();
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Click Page 1", $this->selenium->getTitle());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testRefresh
    public function testRefresh()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_page.slow.html");
            $this->assertEquals("{$this->testUrl}/html/test_page.slow.html", $this->selenium->getLocation());
            $this->assertEquals("Slow Loading Page", $this->selenium->getTitle());

            $this->selenium->click("changeSpan");
            $this->assertEquals("Changed the text", $this->selenium->getText("theSpan"));
            $this->selenium->refresh();
            $this->selenium->waitForPageToLoad(500);
            $this->assertNotEquals("Changed the text", $this->selenium->getText("theSpan"));

            $this->selenium->click("changeSpan");
            $this->assertEquals("Changed the text", $this->selenium->getText("theSpan"));
            $this->selenium->click("slowRefresh");
// Does not work!
//            $this->selenium->waitForPageToLoad(500);
//            $this->assertNotEquals("Changed the text", $this->selenium->getText("theSpan"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testCommenta NO USE
    // public function testComments
    //{}
    // }}}
    // {{{ testLinkEvents
    public function testLinkEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("", $this->selenium->getValue("eventlog"));
            $this->selenium->click("theLink");
            $this->assertEquals("{focus(theLink)} {click(theLink)} {blur(theLink)}", $this->selenium->getValue("eventlog"));
            $this->assertEquals("link clicked", $this->selenium->getAlert());
            $this->selenium->click("theButton");

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testButtonEvents
    public function testButtonEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("", $this->selenium->getValue("eventlog"));
            $this->selenium->click("theButton");
            $this->assertEquals("{focus(theButton)} {click(theButton)} {blur(theButton)}", $this->selenium->getValue("eventlog"));
            $this->selenium->type("eventlog", "");

            $this->selenium->click("theSubmit");
            $this->assertEquals("{focus(theSubmit)} {click(theSubmit)} {submit} {blur(theSubmit)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testSelectEvents
    public function testSelectEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("", $this->selenium->getValue("theSelect"));
            $this->assertEquals("", $this->selenium->getValue("eventlog"));

            $this->selenium->select("theSelect", "First Option");
            $this->assertEquals("option1", $this->selenium->getValue("theSelect"));
            $this->assertEquals("{focus(theSelect)} {change(theSelect)} {blur(theSelect)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->select("theSelect", "First Option");
            $this->assertEquals("option1", $this->selenium->getValue("theSelect"));
            $this->assertEquals("{focus(theSelect)} {blur(theSelect)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->select("theSelect", "Empty Option");
            $this->assertEquals("", $this->selenium->getValue("theSelect"));
            $this->assertEquals("{focus(theSelect)} {change(theSelect)} {blur(theSelect)}", $this->selenium->getValue("eventlog"));


        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testRadioEvents
    public function testRadioEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("off", $this->selenium->getValue("theRadio1"));
            $this->assertEquals("off", $this->selenium->getValue("theRadio2"));
            $this->assertEquals("", $this->selenium->getValue("eventlog"));

            $this->selenium->click("theRadio1");
            $this->assertEquals("on", $this->selenium->getValue("theRadio1"));
            $this->assertEquals("off", $this->selenium->getValue("theRadio2"));
            $this->assertEquals("{focus(theRadio1)} {click(theRadio1)} {change(theRadio1)} {blur(theRadio1)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->click("theRadio2");
            $this->assertEquals("off", $this->selenium->getValue("theRadio1"));
            $this->assertEquals("on", $this->selenium->getValue("theRadio2"));
            $this->assertEquals("{focus(theRadio2)} {click(theRadio2)} {change(theRadio2)} {blur(theRadio2)}", $this->selenium->getValue("eventlog"));


            $this->selenium->type("eventlog", "");
            $this->selenium->click("theRadio2");
            $this->assertEquals("off", $this->selenium->getValue("theRadio1"));
            $this->assertEquals("on", $this->selenium->getValue("theRadio2"));
            $this->assertEquals("{focus(theRadio2)} {click(theRadio2)} {blur(theRadio2)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testCheckboxEvents
    public function testCheckboxEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("off", $this->selenium->getValue("theCheckbox"));
            $this->assertEquals("", $this->selenium->getValue("eventlog"));

            $this->selenium->click("theCheckbox");
            $this->assertEquals("on", $this->selenium->getValue("theCheckbox"));
            $this->assertEquals("{focus(theCheckbox)} {click(theCheckbox)} {change(theCheckbox)} {blur(theCheckbox)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->click("theCheckbox");
            $this->assertEquals("off", $this->selenium->getValue("theCheckbox"));
            $this->assertEquals("{focus(theCheckbox)} {click(theCheckbox)} {change(theCheckbox)} {blur(theCheckbox)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testTextEvents
    public function testTextEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("", $this->selenium->getValue("theTextbox"));
            $this->assertEquals("", $this->selenium->getValue("eventlog"));

            $this->selenium->type("theTextbox", "first value");
            $this->assertEquals("first value", $this->selenium->getValue("theTextbox"));
            $this->assertEquals("{focus(theTextbox)} {select(theTextbox)} {change(theTextbox)} {blur(theTextbox)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->type("theTextbox", "changed value");
            $this->assertEquals("changed value", $this->selenium->getValue("theTextbox"));
            $this->assertEquals("{focus(theTextbox)} {select(theTextbox)} {change(theTextbox)} {blur(theTextbox)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testFireEvents
    public function testFireEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->assertEquals("", $this->selenium->getValue("eventlog"));
            $this->selenium->fireEvent("theTextbox", "focus");
            $this->assertEquals("{focus(theTextbox)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("eventlog", "");
            $this->selenium->fireEvent("theSelect", "change");
            $this->selenium->fireEvent("theSelect", "blur");
            $this->assertEquals("{change(theSelect)} {blur(theSelect)}", $this->selenium->getValue("eventlog"));

            $this->selenium->type("theTextbox", "changed value");

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testMouseEvents
    public function testMouseEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->selenium->mouseOver("theTextbox");
            $this->selenium->mouseOver("theButton");
            $this->selenium->mouseDown("theTextbox");
            $this->selenium->mouseDown("theButton");
            $this->assertEquals("{mouseover(theTextbox)} {mouseover(theButton)} {mousedown(theTextbox)} {mousedown(theButton)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testKeyEvents
    public function testKeyEvents()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_form_events.html");
            $this->selenium->keyPress("theTextbox", "119");
            $this->selenium->keyPress("theTextbox", "115");
            $this->selenium->keyUp("theTextbox", "44");
            $this->selenium->keyDown("theTextbox", "98");
            $this->assertEquals("{keypress(theTextbox - 119)} {keypress(theTextbox - 115)} {keyup(theTextbox - 44)} {keydown(theTextbox - 98)}", $this->selenium->getValue("eventlog"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testFocusOnBlur
    public function testFocusOnBlur()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_focus_on_blur.html");
            $this->selenium->type("testInput", "test");
            $this->assertEquals("Bad value", $this->selenium->getAlert());
            $this->selenium->type("testInput", "somethingelse");
        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testAlerts
    public function testAlerts()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_verify_alert.html");
            $this->assertFalse($this->selenium->isAlertPresent());

            $this->selenium->click("oneAlert");
            $this->assertTrue($this->selenium->isAlertPresent());
            $this->assertEquals("Store Below 494 degrees K!", $this->selenium->getAlert());

            $this->selenium->click("twoAlerts");
            $this->assertEquals("Store Below 220 degrees C!", $this->selenium->getAlert());
// This does not work.
//            $this->selenium->click("alertAndLeave");
//            $this->selenium->waitForPageToLoad(500);
//            $this->assertEquals("I'm Melting! I'm Melting!", $this->selenium->getAlert());


        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testConfirmations
    public function testConfirmations()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_confirm.html");
            $this->selenium->chooseCancelOnNextConfirmation();
            $this->selenium->click("confirmAndLeave");
            $this->assertTrue($this->selenium->isConfirmationPresent());
            $this->assertEquals("You are about to go to a dummy page.", $this->selenium->getConfirmation());
            $this->assertEquals("Test Confirm", $this->selenium->getTitle());

            $this->selenium->click("confirmAndLeave");
            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("You are about to go to a dummy page.", $this->selenium->getConfirmation());
            $this->assertEquals("Dummy Page", $this->selenium->getTitle());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testPrompt
    public function testPrompt()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_prompt.html");
            $this->assertFalse($this->selenium->isPromptPresent());

            $this->selenium->click("promptAndLeave");
            $this->assertTrue($this->selenium->isPromptPresent());
            $this->assertEquals("Type 'yes' and click OK", $this->selenium->getPrompt());
            $this->assertEquals("Test Prompt", $this->selenium->getTitle());
            $this->selenium->answerOnNextPrompt("yes");
            $this->selenium->click("promptAndLeave");

            $this->selenium->waitForPageToLoad(500);
            $this->assertEquals("Type 'yes' and click OK", $this->selenium->getPrompt());
            $this->assertEquals("Dummy Page", $this->selenium->getTitle());

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testVisibility
    public function testVisibility()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_visibility.html");
            $this->assertTrue($this->selenium->isVisible("visibleParagraph"));
            $this->assertFalse($this->selenium->isVisible("hiddenParagraph"));
            $this->assertFalse($this->selenium->isVisible("suppressedParagraph"));
            $this->assertFalse($this->selenium->isVisible("classSuppressedParagraph"));
            $this->assertFalse($this->selenium->isVisible("jsClassSuppressedParagraph"));
            $this->assertFalse($this->selenium->isVisible("hiddenSubElement"));
            $this->assertTrue($this->selenium->isVisible("visibleSubElement"));
            $this->assertFalse($this->selenium->isVisible("suppressedSubElement"));
            $this->assertFalse($this->selenium->isVisible("jsHiddenParagraph"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testEditable
    public function testEditable()
    {
        try {
            $this->selenium->open("{$this->testUrl}/html/test_editable.html");
            $this->assertTrue($this->selenium->isEditable("normal_text"));
            $this->assertTrue($this->selenium->isEditable("normal_select"));
            $this->assertFalse($this->selenium->isEditable("disabled_text"));
            $this->assertFalse($this->selenium->isEditable("disabled_select"));

        } catch (Testing_Selenium_Exception $e) {
            $this->selenium->stop();
            echo $e;
        }
    }
    // }}}
    // {{{ testFallingVerifications
    //    public function testFallingVerifications()
    //    {}
    // }}}
    // {{{ testFallingAssert
    //    public function testFallingAssert
    //    {}
    // }}}
    // {{{ testCommandError
    //    public function testCommandError
    //    {}
    // }}}
     */
}
?>
