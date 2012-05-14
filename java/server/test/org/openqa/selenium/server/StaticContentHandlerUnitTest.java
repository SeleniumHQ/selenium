/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.Resource;

import java.io.File;
import java.io.IOException;
import java.util.Date;

public class StaticContentHandlerUnitTest {
  private StaticContentHandler handler;
  private boolean slowResourcesInitially;

  @Before
  public void setUp() throws Exception {
    handler = new StaticContentHandler("", false);
    slowResourcesInitially = StaticContentHandler.getSlowResources();
  }

  @After
  public void tearDown() {
    StaticContentHandler.setSlowResources(slowResourcesInitially);
  }

  @Test
  public void testShouldMakePageNotCachedWhenHandle() throws Exception {
    HttpResponse response = new HttpResponse();
    handler.handle("", "", new HttpRequest(), response);
    assertEquals("Thu, 01 Jan 1970 00:00:00 GMT", response.getField("Expires"));
  }

  @Test
  public void testShouldDelayResourceLoadingIfSetToSlow() throws Exception {
    long start = new Date().getTime();
    StaticContentHandler.setSlowResources(true);
    handler.getResource("not_exists");
    long end = new Date().getTime();
    assertTrue(end - start >= 0.9 * StaticContentHandler.SERVER_DELAY);
  }

  @Test
  public void testShouldDoubleDelayWithAPageMarkedAsSlow() throws Exception {
    long start = new Date().getTime();
    StaticContentHandler.setSlowResources(true);
    handler.getResource("something-really-slow.html");
    long end = new Date().getTime();
    long diff = end - start;
    System.out.println("diff = " + diff);
    assertTrue(end - start >= 1.9 * StaticContentHandler.SERVER_DELAY);
  }

  @Test
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

  @Test
  public void testShouldReturnMissingResourceIfNoResourceLocated() throws Exception {
    Resource resource = handler.getResource("not exists path");
    assertFalse(resource.exists());
  }

  @Test
  public void testHandleSetsResponseAttributeInCaseOfMissingResource() throws Exception {
    String pathInContext = "/invalid";
    String pathParams = "";
    HttpRequest httpRequest = new HttpRequest();
    HttpResponse httpResponse = new HttpResponse();
    handler.handle(pathInContext, pathParams, httpRequest, httpResponse);
    assertEquals("True", httpResponse.getAttribute("NotFound"));
  }

  @Test
  public void testHandleSetsNoResponseStatusCodeInCaseOfAvailableResource() throws Exception {

    StaticContentHandler mock =
        createMock(StaticContentHandler.class,
            StaticContentHandler.class.getDeclaredMethod("getResource", String.class),
            StaticContentHandler.class.getDeclaredMethod("callSuperHandle", String.class,
                String.class, HttpRequest.class, HttpResponse.class));

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
