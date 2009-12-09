package org.openqa.selenium.server;


import junit.framework.TestCase;

public class BrowserConfigurationOptionsTest extends TestCase {

    public void testInitializationWithNoOptions() {
      new BrowserConfigurationOptions("");
    }
    
    public void testInitializationWithGoodSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile=foo");
      assertEquals("foo", options.getProfile());
      assertTrue(options.hasOptions());
    }
    
    public void testInitializationWithGoodSingleOptionAndWhitespace() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile= foo bar");
      assertEquals("foo bar", options.getProfile());
      assertTrue(options.hasOptions());
    }
    
    public void testInitializationWithBadSingleOption() {
      BrowserConfigurationOptions options = new BrowserConfigurationOptions("profile_foo");
      assertNull(options.getProfile());
      assertFalse(options.hasOptions());
    }
    
    public void testInitializationWithGoodOptionsAndWhitespace() {
      BrowserConfigurationOptions options = 
        new BrowserConfigurationOptions("profile=foo ; unknown=bar");
      assertEquals("foo", options.getProfile());
      assertTrue(options.hasOptions());
    }
    
    public void testToStringEquivalentToSerialize() {
        String[] tests = { "", "foo", "foo bar", null };
        
        BrowserConfigurationOptions options = new BrowserConfigurationOptions();
        
        for (String test : tests) {
            options.set("profile", test);
            assertEquals(options.serialize(), options.toString());
        }
    }
}