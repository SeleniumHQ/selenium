package org.openqa.selenium.server;

import java.io.IOException;

import org.mortbay.http.HttpContext;
import org.mortbay.util.Resource;

public class ClasspathResourceLocator implements ResourceLocator {
    public Resource getResource(HttpContext context, String pathInContext) throws IOException {
        Resource resource = new ClassPathResource(pathInContext);
        context.getResourceMetaData(resource);
        return resource;
    }
}
