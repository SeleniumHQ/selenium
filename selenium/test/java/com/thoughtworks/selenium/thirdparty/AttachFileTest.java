package com.thoughtworks.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class AttachFileTest extends SeleneseTestNgHelper {
    
    @Test
    public void testAttachfile() throws Throwable {
		selenium.open("http://www.snipshot.com");
		assertEquals("Snipshot: Edit pictures online", selenium.getTitle());
		
		selenium.attachFile("file", "http://www.google.com/intl/en_ALL/images/logo.gif");
		
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isElementPresent("save")) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}
		assertTrue(selenium.isElementPresent("resize"));
		assertTrue(selenium.isElementPresent("crop"));
        
        
    }

}
