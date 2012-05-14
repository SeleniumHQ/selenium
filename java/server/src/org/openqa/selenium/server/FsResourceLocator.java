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

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

import java.io.File;
import java.io.IOException;

public class FsResourceLocator implements ResourceLocator {
  private File rootDir;
  private static final String USER_EXTENSIONS_JS_NAME = "user-extensions.js";
  private static final String TEST_DIR = "/tests";

  public FsResourceLocator(File directory) {
    this.rootDir = directory;
  }

  public Resource getResource(HttpContext context, String pathInContext) throws IOException {
    File file = new File(rootDir, pathInContext);
    Resource resource = createFileResource(file, context);
    // Throw in a hack to make it easier to install user extensions
    if (!resource.exists() && file.getName().equals(USER_EXTENSIONS_JS_NAME)) {
      resource = userExtensionResource(context);
      if (resource.exists()) return resource;
    }
    // And another hack to make the -htmlSuite appear in the /tests directory
    if (!resource.exists() && pathInContext.startsWith(TEST_DIR)) {
      File testFile = new File(rootDir, pathInContext.substring(TEST_DIR.length()));
      resource = createFileResource(testFile, context);
      if (resource.exists()) return resource;
    }
    return resource;
  }

  private Resource userExtensionResource(HttpContext context) throws IOException {
    File extensions = new File(rootDir, USER_EXTENSIONS_JS_NAME);
    return createFileResource(extensions, context);
  }

  private Resource createFileResource(File file, HttpContext context) throws IOException {
    Resource resource = new FutureFileResource(file.toURI().toURL());
    context.getResourceMetaData(resource);
    return resource;
  }
}
