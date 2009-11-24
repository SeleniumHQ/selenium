package org.openqa.selenium.server;

import java.net.MalformedURLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.jetty.util.Resource;
import org.openqa.jetty.http.handler.ResourceHandler;

/**
 * We want to take advantage of the handling capabilities of the standard
 * ResourceHandler. This class is a thin wrapper that handles requests for
 * resources based on the per-session extension Javascript.
 */
class SessionExtensionJsHandler extends ResourceHandler {
    public static final Pattern PATH_PATTERN =
        Pattern.compile("user-extensions.js\\[([0-9a-f]{32})\\]$");
    
    /**
     * Returning null indicates there is no resource to be had.
     */
    @Override
    public Resource getResource(String pathInContext)
        throws MalformedURLException
    {
        String sessionId = getSessionId(pathInContext);
        if (sessionId != null) {
            String extensionJs = FrameGroupCommandQueueSet
                .getQueueSet(sessionId).getExtensionJs();
            Resource resource = new SessionExtensionJsResource(extensionJs);
            getHttpContext().getResourceMetaData(resource);
            return resource;
        }
        return null;
    }
    
    private String getSessionId(String pathInContext) {
        Matcher m = PATH_PATTERN.matcher(pathInContext);
        return (m.find() ? m.group(1) : null);
    }
}
