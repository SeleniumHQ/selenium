/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.HttpResponse;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.Renderer;

public class RedirectResult implements Renderer {

  private final String url;

  public RedirectResult(String url) {
    this.url = url;
  }

  public void render(HttpRequest request, HttpResponse response, RestishHandler handler)
      throws Exception {
    StringBuilder builder = new StringBuilder(request.getAppUri());

    String[] urlParts = url.split("/");
    for (String part : urlParts) {
      if (part.length() == 0) {
        continue;
      }

      builder.append("/");
      if (part.startsWith(":")) {
        builder.append(get(handler, part));
      } else {
        builder.append(part);
      }
    }

    response.sendRedirect(builder.toString());
  }

  private String get(RestishHandler handler, String part) throws Exception {
    if (part.length() < 1) {
      return "";
    }

    String propertyName = part.substring(1);

    Object value = PropertyMunger.get(propertyName, handler);
    return value == null ? "" : String.valueOf(value);
  }
}
