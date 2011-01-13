package org.openqa.selenium.server;

import junit.framework.TestCase;

import java.io.IOException;

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

public class ClasspathResourceLocatorUnitTest extends TestCase {
    public void testShouldGetResourceFromClasspath() throws Exception {
        Resource resource = getResourceFromClasspath("ClasspathResourceLocatorUnitTest.class");
        assertNotNull(resource.getInputStream());
    }

    public void testShouldReturnMissingResourceWhenResourceNotFound() throws Exception {
        Resource resource = getResourceFromClasspath("not_exists");
        assertFalse(resource.exists());
        assertNull(resource.getInputStream());
    }

    public void testShouldStoreFileNameInMetaData() throws Exception {
    	String filename = "ClasspathResourceLocatorUnitTest.class";
        Resource resource = getResourceFromClasspath(filename);
        assertEquals("toString() must end with filename, because Jetty used this method to determine file type",
        		filename, resource.toString());		
	}
    
    private Resource getResourceFromClasspath(String path) throws IOException {
        ClasspathResourceLocator locator = new ClasspathResourceLocator();
        return locator.getResource(new HttpContext(), path);
    }

}
