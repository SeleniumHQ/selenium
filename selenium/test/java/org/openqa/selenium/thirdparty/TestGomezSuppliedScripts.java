package org.openqa.selenium.thirdparty;

import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class TestGomezSuppliedScripts extends SeleneseTestNgHelper {
    @Test
    public void RC108() throws Exception {
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
    }

    @Test
    public void RC112() throws Exception {
        selenium.open("https://www.webperform.com/ui/");
    }

    @Test
    public void RC169() throws Exception {
        selenium.open("http://www.friendster.com/join.php");
        selenium.click("link=Log In");
        selenium.waitForPageToLoad("30000");
    }

    @Test
    public void RC188() throws Exception {
        selenium.open("http://www.google.com");
        assertTrue(selenium.isVisible("q"));
    }

    @Test
    public void RC210() throws Exception {
        selenium.open("http://www.google.cn/");
        selenium.keyPress("q", "t");
        selenium.keyPress("q", "e");
        selenium.keyPress("q", "s");
        selenium.keyPress("q", "t");
        selenium.click("btnG");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("test"));
    }

    @Test
    public void RC294() throws Exception {
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
    }

}
