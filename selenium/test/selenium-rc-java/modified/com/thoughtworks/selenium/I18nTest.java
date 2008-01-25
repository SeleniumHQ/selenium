/*
 * Created on Apr 17, 2006
 *
 */
package com.thoughtworks.selenium;

import com.thoughtworks.webdriver.environment.GlobalTestEnvironment;
import com.thoughtworks.webdriver.environment.TestEnvironment;
import com.googlecode.webdriver.selenium.SeleniumTestEnvironment;
import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import org.openqa.selenium.server.SeleniumServer;

import java.io.UnsupportedEncodingException;

public class I18nTest extends TestCase {
    private static Selenium sel;
    private static String startUrl;
    
    public static Test suite() {
    	 return new I18nTestSetup(new TestSuite(I18nTest.class));
    }

    private static class I18nTestSetup extends TestSetup {
        public I18nTestSetup(Test test) {
            super(test);
        }
        
        public void setUp() throws Exception {
        	TestEnvironment testEnvironment = GlobalTestEnvironment.get();
        	if (testEnvironment == null) {
        		testEnvironment = new SeleniumTestEnvironment();
        		GlobalTestEnvironment.set(testEnvironment);
        	}
         	startUrl = testEnvironment.getAppServer().getBaseUrl();
         	
            try {
                sel = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*firefox", startUrl);
                sel.start();
            } catch (Exception e) {
                e.printStackTrace();
                throw e;
            }
        }
        
        public void tearDown() throws Exception {
            try {
                sel.stop();
            } catch (Exception e) {
                throw e;
            }
            //server.stop();
        }
        
    }
    
    protected void tearDown() {
    	sel.stop();
    }
    
    public void testRomance() throws UnsupportedEncodingException {
        String expected = "\u00FC\u00F6\u00E4\u00DC\u00D6\u00C4 \u00E7\u00E8\u00E9 \u00BF\u00F1 \u00E8\u00E0\u00F9\u00F2";
        String id = "romance";
        verifyText(expected, id);
    }
    
    public void testKorean() throws UnsupportedEncodingException {
        String expected = "\uC5F4\uC5D0";
        String id = "korean";
        verifyText(expected, id);
    }
    
    public void testChinese() throws UnsupportedEncodingException {
        String expected = "\u4E2D\u6587";
        String id = "chinese";
        verifyText(expected, id);
    }
    
    public void testJapanese() throws UnsupportedEncodingException {
        String expected = "\u307E\u3077";
        String id = "japanese";
        verifyText(expected, id);
    }
    
    public void testDangerous() throws UnsupportedEncodingException {
        String expected = "&%?\\+|,%*";
        String id = "dangerous";
        verifyText(expected, id);
    }

    private void verifyText(String expected, String id) throws UnsupportedEncodingException {
        System.out.println(getName());
        System.out.println(expected);
        sel.open(startUrl + "selenium-server/tests/html/test_i18n.html");
        assertTrue(sel.isTextPresent(expected));
        String actual = sel.getText(id);
        byte[] result = actual.getBytes("UTF-8");
        for (int i = 0; i < result.length; i++) {
            Byte b = new Byte(result[i]);
            System.out.println("BYTE " + i + ": " + b.toString());
        }
        assertEquals(id + " characters didn't match", expected, actual);
    }


}
