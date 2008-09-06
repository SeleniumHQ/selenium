package org.openqa.selenium.thirdparty;

import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class GoogleTest extends SeleneseTestNgHelper {
    @Test
    public void homepage() {
        selenium.open("http://www.google.com");
    }

    @Test
    public void simpleSearch() {
        selenium.open("http://www.google.com");
        selenium.type("q", "OpenQA");
        selenium.click("btnG");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.getBodyText().contains("Open source test automation tool for executing scenarios against web applications to validate browser compatibility and system functionality."));
    }

    @Test(enabled = false)
    // DGF this test is too brittle
    public void testMaps() throws InterruptedException {
        selenium.open("http://maps.google.com");
        selenium.getEval("window.moveTo(0, 0)");
        selenium.getEval("window.resizeTo(800, 600)");

        selenium.type("q_d", "1600 pennsylvania, washington dc");
        selenium.click("q_sub");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2.66&x=18743&s=&y=25070')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.click("//img[contains(@src, 'iw_close.gif')]");
        selenium.click("//div[text() = 'Satellite']");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=18743&s=&y=25070')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.click("panelarrow");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (!selenium.isElementPresent("//div[@class = 'hide-arrow']")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.click("//div[@title = 'Zoom In']");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37487&s=&y=50140')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37487&s=&y=50140')]", "+250,-250");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37487&s=&y=50140')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37487&s=&y=50140')]", "+250,-250");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37486&s=&y=50141')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37486&s=&y=50141')]", "+250,-250");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37484&s=&y=50142')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37484&s=&y=50142')]", "+250,-250");
        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37484&s=&y=50142')]", "+150,-500");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50143')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50143')]", "0,-500");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50144')]", "0,-150");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37482&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37484&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37484&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37486&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37486&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37488&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37488&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37491&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37491&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37493&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37493&s=&y=50144')]", "-600,0");
        for (int second = 0; ; second++) {
            if (second >= 60) fail("timeout");
            try {
                if (selenium.isElementPresent("//img[contains(@src, 'v=w2t.66&x=37495&s=&y=50144')]")) break;
            } catch (Exception e) {
            }
            Thread.sleep(1000);
        }

        Thread.sleep(2000);
        selenium.dragAndDrop("//img[contains(@src, 'v=w2t.66&x=37495&s=&y=50144')]", "-600,0");
    }

    @Test
    public void finance() throws InterruptedException {
        selenium.open("http://finance.google.com");
        selenium.typeKeys("searchbox", "Cis");
        Thread.sleep(2000);
        selenium.typeKeys("searchbox", "co");
        selenium.click("//input[@value = 'Get quotes']");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("Cisco Systems, Inc"));
    }

    @Test
    public void suggest() throws InterruptedException {
        selenium.open("http://www.google.com/webhp?complete=1&hl=en");
        selenium.typeKeys("q", "g");
        Thread.sleep(1000);
        selenium.typeKeys("q", "o");
        Thread.sleep(1000);
        selenium.typeKeys("q", "m");
        Thread.sleep(1000);
        selenium.typeKeys("q", "e");
        Thread.sleep(1000);
        selenium.fireEvent("q", "blur");
        selenium.type("q", "");
        selenium.typeKeys("q", "o");
        Thread.sleep(1000);
        selenium.typeKeys("q", "p");
        Thread.sleep(1000);
        selenium.typeKeys("q", "e");
        Thread.sleep(1000);
        selenium.typeKeys("q", "n");
        Thread.sleep(1000);
        selenium.typeKeys("q", "q");
        Thread.sleep(1000);
        selenium.typeKeys("q", "a");
        Thread.sleep(1000);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        Thread.sleep(500);
        selenium.keyPress("q", "\\40");
        selenium.click("btnG");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("Open source test automation tool for executing"));
    }
}
