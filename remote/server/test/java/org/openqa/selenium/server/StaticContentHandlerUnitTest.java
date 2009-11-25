package org.openqa.selenium.server;

import junit.framework.TestCase;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.expect;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.Resource;

import java.io.File;
import java.io.IOException;
import java.util.Date;

public class StaticContentHandlerUnitTest extends TestCase {
    private StaticContentHandler handler;
    private boolean slowResourcesInitially;

    public void setUp() throws Exception {
        super.setUp();
        handler = new StaticContentHandler("", false);
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

    public void testHandleSetsResponseAttributeInCaseOfMissingResource() throws Exception {
    	String pathInContext = "/invalid";
    	String pathParams = "";
    	HttpRequest httpRequest = new HttpRequest();
    	HttpResponse httpResponse = new HttpResponse();
    	handler.handle(pathInContext, pathParams, httpRequest, httpResponse);
    	assertEquals("True", httpResponse.getAttribute("NotFound"));
    }
    
    public void testHandleSetsNoResponseStatusCodeInCaseOfAvailableResource() throws Exception {
    	
    	StaticContentHandler mock = createMock(StaticContentHandler.class,
                StaticContentHandler.class.getDeclaredMethod("getResource", String.class),
                StaticContentHandler.class.getDeclaredMethod("callSuperHandle", String.class, String.class, HttpRequest.class, HttpResponse.class));

    	String pathInContext = "/driver/?cmd=getNewBrowserSession&1=*chrome&2=http://www.google.com";
    	String pathParams = "";
    	HttpRequest httpRequest = new HttpRequest();
    	HttpResponse httpResponse = new HttpResponse();
    	
    	expect(mock.getResource(pathInContext)).andReturn(Resource.newResource("found_resource"));
    	mock.callSuperHandle(pathInContext, pathParams, httpRequest, httpResponse);
    	expectLastCall().once();
    	replay(mock);
    	
    	mock.handle(pathInContext, pathParams, httpRequest, httpResponse);
    	assertEquals(HttpResponse.__200_OK, httpResponse.getStatus());
    	verify(mock);
    }
    

}
