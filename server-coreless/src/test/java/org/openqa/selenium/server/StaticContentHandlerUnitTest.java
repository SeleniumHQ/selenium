package org.openqa.selenium.server;

import junit.framework.TestCase;
import org.mortbay.http.HttpContext;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.util.Resource;

import java.io.File;
import java.io.IOException;
import java.util.Date;

public class StaticContentHandlerUnitTest extends TestCase {
    private StaticContentHandler handler;
    private boolean slowResourcesInitially;

    public void setUp() throws Exception {
        super.setUp();
        handler = new StaticContentHandler("");
        slowResourcesInitially = StaticContentHandler.getSlowResources();
    }
    
    public void tearDown() {
        StaticContentHandler.setSlowResources(slowResourcesInitially);
    }

    public void testShouldMakePageNotCachedWhenHandle() throws Exception {
        HttpResponse response = new HttpResponse();
        handler.handle("", "", new HttpRequest(), response);
        assertEquals("Thu, 01 Jan 1970 00:00:00 GMT", response.getField("Expires"));
    }
    
    public void testShouldDelayResourceLoadingIfSetToSlow() throws Exception {
        long start = new Date().getTime();
        StaticContentHandler.setSlowResources(true);
        handler.getResource("not_exists");
        long end = new Date().getTime();
        assertTrue(end - start >= 0.9 * StaticContentHandler.SERVER_DELAY);
    }

    public void testShouldDoubleDelayWithAPageMarkedAsSlow() throws Exception {
        long start = new Date().getTime();
        StaticContentHandler.setSlowResources(true);
        handler.getResource("something-really-slow.html");
        long end = new Date().getTime();
        long diff = end - start;
        System.out.println("diff = " + diff);
        assertTrue(end - start >= 1.9 * StaticContentHandler.SERVER_DELAY);
    }

    public void testShouldReturnTheFirstResourceLocatedByLocators() throws Exception {
        final File file = File.createTempFile("selenium-test-", "");
        file.deleteOnExit();
        handler.addStaticContent(new ResourceLocator() {
            public Resource getResource(HttpContext context, String pathInContext) throws IOException {
                return Resource.newResource("Missing");
            }
        });
        handler.addStaticContent(new ResourceLocator() {
            public Resource getResource(HttpContext context, String pathInContext) throws IOException {
                return Resource.newResource(file.toURI().toURL());
            }
        });
        assertEquals(file, handler.getResource(file.toURI().toURL().toString()).getFile());
    }

    public void testShouldReturnMissingResourceIfNoResourceLocated() throws Exception {
        Resource resource = handler.getResource("not exists path");
        assertFalse(resource.exists());
    }
}
