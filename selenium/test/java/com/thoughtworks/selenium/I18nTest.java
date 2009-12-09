/*
 * Created on Apr 17, 2006
 *
 */
package com.thoughtworks.selenium;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import java.io.UnsupportedEncodingException;

public class I18nTest extends TestCase {
    
    private static String startUrl = "http://localhost:" + RemoteControlConfiguration.getDefaultPort();
    private static Selenium sel;
    
    public static Test suite() {
        return new I18nTestSetup(new TestSuite(I18nTest.class), "*mock", true);
    }
    
    protected static class I18nTestSetup extends TestSetup {

        String browser;
        boolean launchServer;
        SeleniumServer server;
        
        public I18nTestSetup(Test test, String browser, boolean launchServer) {
            super(test);
            this.browser = browser;
            this.launchServer = launchServer;
        }
        
        public void setUp() throws Exception {
            if (launchServer) {
                server = new SeleniumServer();
                server.start();
            }
            try {
                sel = new DefaultSelenium("localhost", RemoteControlConfiguration.getDefaultPort(), browser,
                        startUrl);
                sel.start();
                sel.open(startUrl + "/selenium-server/tests/html/test_i18n.html");
            } catch (Exception e) {
                e.printStackTrace();
                throw e;
            }
        }
        
        public void tearDown() throws Exception {
            sel.stop();
            if (launchServer) server.stop();
        }
        
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
    
    public void testDangerousLabels() {
        String[] labels = sel.getSelectOptions("dangerous-labels");
        assertEquals("Wrong number of labels", 3, labels.length);
        assertEquals("mangled label", "veni, vidi, vici", labels[0]);
        assertEquals("mangled label", "c:\\foo\\bar", labels[1]);
        assertEquals("mangled label", "c:\\I came, I \\saw\\, I conquered", labels[2]);
    }

    private void verifyText(String expected, String id) throws UnsupportedEncodingException {
        System.out.println(getName());
        System.out.println(expected);
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
