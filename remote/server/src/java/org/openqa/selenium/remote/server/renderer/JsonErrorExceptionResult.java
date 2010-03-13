/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.rest.Handler;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class JsonErrorExceptionResult extends ErrorJsonResult {
  private final ErrorCodes errorCodes;
  private final String exceptionName;

  public JsonErrorExceptionResult(String exceptionName, String responseOn) {
    super(responseOn);
    this.exceptionName = exceptionName.substring(1);
    this.errorCodes = new ErrorCodes();
  }

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {
    Exception e = (Exception) request.getAttribute(exceptionName);

    Response res = new Response();
    res.setStatus(errorCodes.toStatusCode(e));

    if (e != null) {
      String raw = new BeanToJsonConverter().convert(e);
      JSONObject error = new JSONObject(raw);
      error.put("screen", request.getAttribute("screen"));
      res.setValue(error);
    }

    request.setAttribute(propertyName, res);

    super.render(request, response, handler);
  }
}
