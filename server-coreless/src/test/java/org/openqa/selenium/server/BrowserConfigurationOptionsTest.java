package org.openqa.selenium.server;


import junit.framework.TestCase;

public class BrowserConfigurationOptionsTest extends TestCase {

    public void testInitializationWithNoOptions() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("");
    }
    
    public void testInitializationWithGoodSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile:foo");
      assertEquals("foo", options.getProfile());
      assertTrue(options.hasOptions());
    }
    
    public void testInitializationWithGoodSingleOptionAndWhitespace() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile: foo bar");
      assertEquals("foo bar", options.getProfile());
      assertTrue(options.hasOptions());
    }
    
    public void testInitializationWithBadSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile_foo");
      assertEquals("", options.getProfile());
      assertFalse(options.hasOptions());
    }
    
    public void testInitializationWithGoodOptionsAndWhitespace() {
      BrowserConfigurationOptions options = 
        new BrowserConfigurationOptions("profile:foo ; unknown:bar");
      assertEquals("foo", options.getProfile());
      assertTrue(options.hasOptions());
    }
}