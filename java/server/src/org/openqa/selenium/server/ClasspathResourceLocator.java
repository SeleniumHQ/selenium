package org.openqa.selenium.server;

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

import java.io.IOException;

public class ClasspathResourceLocator implements ResourceLocator {

  public Resource getResource(HttpContext context, String pathInContext) throws IOException {
    Resource resource = new ClassPathResource(pathInContext);
    context.getResourceMetaData(resource);
    return resource;
  }

}
