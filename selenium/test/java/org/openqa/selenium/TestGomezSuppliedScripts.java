package org.openqa.selenium;

import static org.testng.Assert.assertTrue;
import org.testng.annotations.Test;

public class TestGomezSuppliedScripts extends AbstractTest {
    @Test
    public void RC108() throws Exception {
        try {
            selenium.open("http://www.hrs.com");
            selenium.type("document.searchForm.location", "Frankfurt Airport");
            selenium.select("//*[text() = 'Search within radius of']/..//select", "label=5");
            selenium.select("minRating", "label=4");
            selenium.click("//div[5]/input");
            selenium.waitForPageToLoad("30000");
            selenium.selectWindow("null");
            selenium.click("link=Frankfurt*");
            selenium.waitForPageToLoad("30000");
            for (int second = 0; ; second++) {
                if (second >= 60) fail("timeout");
                try {
                    if (!selenium.isTextPresent("The hotel list is loading ...")) break;
                } catch (Exception e) {
                }
                Thread.sleep(1000);
            }

            selenium.selectFrame("mainFrame");
            for (int second = 0; ; second++) {
                if (second >= 60) fail("timeout");
                try {
                    if (selenium.isTextPresent("Frankfurt am Main")) break;
                } catch (Exception e) {
                }
                Thread.sleep(1000);
            }

            selenium.click("hotelnumbers");
            selenium.click("document.dummyForm.hotelnumbers[1]");
            selenium.click("hotelComparisonButton");
            selenium.waitForPageToLoad("30000");
            assertTrue(selenium.isTextPresent("compare 2 marked hotels"));
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC108", t);
        }

        pass("GomezSuppliedScripts.RC108");
    }

    @Test
    public void RC112() throws Exception {
        try {
            selenium.open("https://www.webperform.com/ui/");
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC112", t);
        }

        pass("GomezSuppliedScripts.RC112");
    }

    @Test
    public void RC169() throws Exception {
        try {
            selenium.open("http://www.friendster.com/join.php");
            selenium.click("link=Log In");
            selenium.waitForPageToLoad("30000");
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC169", t);
        }

        pass("GomezSuppliedScripts.RC169");
    }

    @Test
    public void RC188() throws Exception {
        try {
            selenium.open("http://www.google.com");
            assertTrue(selenium.isVisible("q"));
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC188", t);
        }

        pass("GomezSuppliedScripts.RC188");
    }

    @Test
    public void RC210() throws Exception {
        try {
            selenium.open("http://www.google.cn/");
            selenium.keyPress("q", "t");
            selenium.keyPress("q", "e");
            selenium.keyPress("q", "s");
            selenium.keyPress("q", "t");
            selenium.click("btnG");
            selenium.waitForPageToLoad("30000");
            assertTrue(selenium.isTextPresent("test"));
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC210", t);
        }

        pass("GomezSuppliedScripts.RC210");
    }

    @Test
    public void RC294() throws Exception {
        try {
            selenium.open("http://www.frontierairlines.com/frontier/home.do");
            selenium.type("flying-from", "LAS");
            selenium.type("returning-from", "IAH");
            selenium.click("submit-flight-finder-main");
            selenium.waitForPageToLoad("30000");
            selenium.select("depMonth", "label=Oct");
            selenium.select("retMonth", "label=Nov");
            selenium.click("//input[@value='Search']");
            selenium.waitForPageToLoad("30000");
            selenium.click("Submit");
            selenium.waitForPageToLoad("30000");
            selenium.click("Submit");
            selenium.waitForPageToLoad("30000");
            selenium.click("//input[@value='Continue']");
            selenium.waitForPageToLoad("30000");
        } catch (Throwable t) {
            fail("GomezSuppliedScripts.RC294", t);
        }

        pass("GomezSuppliedScripts.RC294");
    }

}
