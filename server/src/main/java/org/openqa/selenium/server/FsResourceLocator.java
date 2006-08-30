package org.openqa.selenium.server;

import org.mortbay.http.HttpContext;
import org.mortbay.util.Resource;

import java.io.File;
import java.io.IOException;

public class FsResourceLocator implements ResourceLocator {
    private File rootDir;
    private static final String USER_EXTENSIONS_JS_NAME = "user-extensions.js";

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
        return resource;
    }

    private Resource userExtensionResource(HttpContext context) throws IOException {
        File extensions = new File(rootDir, USER_EXTENSIONS_JS_NAME);
        return createFileResource(extensions, context);
    }

    private Resource createFileResource(File file, HttpContext context) throws IOException {
        Resource resource = Resource.newResource(file.toURI().toURL());
        context.getResourceMetaData(resource);
        return resource;
    }
}