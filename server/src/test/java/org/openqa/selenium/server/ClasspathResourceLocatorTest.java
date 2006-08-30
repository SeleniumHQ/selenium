package org.openqa.selenium.server;

import junit.framework.TestCase;
import org.mortbay.http.HttpContext;
import org.mortbay.util.Resource;

import java.io.IOException;

public class ClasspathResourceLocatorTest extends TestCase {
    public void testShouldGetResourceFromClasspath() throws Exception {
        Resource resource = getResourceFromClasspath("ClasspathResourceLocatorTest.class");
        assertNotNull(resource.getInputStream());
    }

    public void testShouldReturnMissingResourceWhenResourceNotFound() throws Exception {
        Resource resource = getResourceFromClasspath("not_exists");
        assertFalse(resource.exists());
        assertNull(resource.getInputStream());
    }

    private Resource getResourceFromClasspath(String path) throws IOException {
        ClasspathResourceLocator locator = new ClasspathResourceLocator();
        return locator.getResource(new HttpContext(), path);
    }

}
