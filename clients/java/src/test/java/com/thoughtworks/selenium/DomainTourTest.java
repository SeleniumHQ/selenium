package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;

public class DomainTourTest extends TestCase
{
	private Selenium selenium;

	public void setUp() throws Exception {
        String url = "http://www.google.com";
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*iexplore", url);
        selenium.start();
    }

	protected void tearDown() throws Exception {
        selenium.stop();
    }

	public void testGoogleTestSearch() throws Throwable {
	    // interesting because they write just a few bytes for their initial burst; buffering is 
        // required to recognize it as HTML:
        selenium.open("http://www.youtube.com");
        
        selenium.open("http://maps.google.com/maps?f=q&hl=en&q=646+Judson+Ave.,+60202&ie=UTF8&om=1");
        // selenium.open("http://www.gmail.com");  had to disable because it redirects to https  :(
        selenium.open("http://www.MapQuest.com");
        selenium.open("http://www.Macromedia.com");
        selenium.open("http://www.Adobe.com");
        selenium.open("http://www.thoughtworks.com");
        selenium.open("http://www.delicio.us");
	}
	
}
