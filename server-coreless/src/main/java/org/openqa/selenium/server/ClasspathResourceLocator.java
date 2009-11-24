package org.openqa.selenium.server;

import java.io.IOException;

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

public class ClasspathResourceLocator implements ResourceLocator {

    public Resource getResource(HttpContext context, String pathInContext) throws IOException {
        Resource resource = new ClassPathResource(pathInContext);
        context.getResourceMetaData(resource);
        return resource;
    }

}
