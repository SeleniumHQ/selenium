/*
Copyright 2011 Selenium committers

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

import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.HttpResponse;
import org.openqa.selenium.remote.server.rest.Renderer;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.net.URL;

import static org.openqa.selenium.remote.server.HttpStatusCodes.NOT_FOUND;
import static org.openqa.selenium.remote.server.HttpStatusCodes.OK;

public class ResourceCopyResult implements Renderer {

  private final String propertyName;

  public ResourceCopyResult(String propertyName) {
    if (propertyName.startsWith(":")) {
      this.propertyName = propertyName.substring(1);
    } else {
      this.propertyName = propertyName;
    }
  }

  public void render(HttpRequest request, HttpResponse response, RestishHandler handler) throws Exception {
    URL resource = (URL) request.getAttribute(propertyName);
    if (resource == null) {
      response.setStatus(NOT_FOUND);
      return;
    }

    response.setStatus(OK);
    response.setContent(ByteStreams.toByteArray(resource.openStream()));
  }
}
