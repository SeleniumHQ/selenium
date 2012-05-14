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

import org.openqa.jetty.http.handler.ResourceHandler;
import org.openqa.jetty.util.Resource;

import java.net.MalformedURLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * We want to take advantage of the handling capabilities of the standard ResourceHandler. This
 * class is a thin wrapper that handles requests for resources based on the per-session extension
 * Javascript.
 */
class SessionExtensionJsHandler extends ResourceHandler {
  public static final Pattern PATH_PATTERN =
      Pattern.compile("user-extensions.js\\[([0-9a-f]{32})\\]$");

  /**
   * Returning null indicates there is no resource to be had.
   */
  @Override
  public Resource getResource(String pathInContext)
      throws MalformedURLException {
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
