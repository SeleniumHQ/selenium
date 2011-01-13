package org.openqa.selenium.server;

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.util.Resource;

import java.io.IOException;

public interface ResourceLocator {

    Resource getResource(HttpContext context, String pathInContext) throws IOException;
}
