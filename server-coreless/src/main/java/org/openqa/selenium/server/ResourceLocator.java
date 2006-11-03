package org.openqa.selenium.server;

import org.mortbay.http.HttpContext;
import org.mortbay.util.Resource;

import java.io.IOException;

public interface ResourceLocator {

    Resource getResource(HttpContext context, String pathInContext) throws IOException;
}
