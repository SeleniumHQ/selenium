package org.openqa.selenium.server.browserlaunchers;

import java.lang.reflect.Field;
import java.util.Map;

import junit.framework.TestCase;

import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

/** Every supported browser launcher needs one consistent constructor */
public class ConstructorTest extends TestCase {
    @SuppressWarnings("unchecked")
    public void testAllBrowserLaunchers() throws Exception{
        Field supportedBrowsers = BrowserLauncherFactory.class.getDeclaredField("supportedBrowsers");
        supportedBrowsers.setAccessible(true);
        Map<String, Class<? extends BrowserLauncher>> map = 
            (Map<String, Class<? extends BrowserLauncher>>) supportedBrowsers.get(null);
        
        for (Class<? extends BrowserLauncher> c : map.values()) {
            try {
                c.getConstructor(BrowserConfigurationOptions.class, RemoteControlConfiguration.class, String.class, String.class);
            } catch (Exception e) {
                throw new RuntimeException(c.getSimpleName(), e);
            }
        }
    }
}
