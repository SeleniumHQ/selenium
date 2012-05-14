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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

import java.io.IOException;

public class ClasspathResourceLocatorUnitTest {

  @Test
  @Ignore
  public void testShouldGetResourceFromClasspath() throws Exception {
    Resource resource = getResourceFromClasspath("ClasspathResourceLocatorUnitTest.class");
    assertNotNull(resource.getInputStream());
  }

  @Test
  public void testShouldReturnMissingResourceWhenResourceNotFound() throws Exception {
    Resource resource = getResourceFromClasspath("not_exists");
    assertFalse(resource.exists());
    assertNull(resource.getInputStream());
  }

  @Test
  public void testShouldStoreFileNameInMetaData() throws Exception {
    String filename = "ClasspathResourceLocatorUnitTest.class";
    Resource resource = getResourceFromClasspath(filename);
    assertEquals(
        "toString() must end with filename, because Jetty used this method to determine file type",
        filename, resource.toString());
  }

  private Resource getResourceFromClasspath(String path) throws IOException {
    ClasspathResourceLocator locator = new ClasspathResourceLocator();
    return locator.getResource(new HttpContext(), path);
  }

}
