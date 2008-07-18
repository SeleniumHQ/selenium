package org.openqa.selenium.server;


import junit.framework.TestCase;

public class BrowserConfigurationOptionsTest extends TestCase {

    public void testInitializationWithNoOptions() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("");
    }
    
    public void testInitializationWithGoodSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile:foo");
      assertEquals("foo", options.getProfile());
    }
    
    public void testInitializationWithGoodSingleOptionAndWhitespace() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile: foo bar");
      assertEquals("foo bar", options.getProfile());
    }
    
    public void testInitializationWithBadSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile_foo");
      assertEquals("", options.getProfile());
    }
    
    public void testInitializationWithGoodOptionsAndWhitespace() {
      BrowserConfigurationOptions options = 
        new BrowserConfigurationOptions("profile:foo ; unknown:bar");
      assertEquals("foo", options.getProfile());
    }
}