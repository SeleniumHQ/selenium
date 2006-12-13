package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

public class FirefoxChromeLauncherTest extends TestCase {
    public void testShouldAbleToCreateChromeUrlWithNormalUrl() throws Exception {
        String httpUrl = "http://www.my.com/folder/endname.html?a=aaa&b=bbb";
        String chromeUrl = new FirefoxChromeLauncher.ChromeUrlConvert().convert(httpUrl, 4444);
        assertEquals("chrome://src/content/endname.html?a=aaa&b=bbb",
                chromeUrl);
    }
}
