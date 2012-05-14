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

import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.HttpResponse;
import org.openqa.selenium.remote.server.HttpStatusCodes;
import org.openqa.selenium.remote.server.rest.RestishHandler;

public class ErrorJsonResult extends JsonResult {

  public ErrorJsonResult(String propertyName) {
    super(propertyName);
  }

  @Override
  public void render(HttpRequest request, HttpResponse response, RestishHandler handler)
      throws Exception {
    response.setStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    super.render(request, response, handler);
  }
}
