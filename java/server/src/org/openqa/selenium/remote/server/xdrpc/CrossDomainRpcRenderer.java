/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.xdrpc;

import com.google.common.base.Charsets;

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.renderer.JsonErrorExceptionResult;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.Renderer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Renders a HTTP response for a {@link CrossDomainRpc}.
 */
public class CrossDomainRpcRenderer implements Renderer {

  private final String responsePropertyName;
  private final String errorPropertyName;
  private final JsonErrorExceptionResult  exceptionResult;

  /**
   * Creates a new renderer.
   *
   * @param responsePropertyName The name of the property on a request object
   *     that contains the response to send to the client.
   * @param errorPropertyName The name of the property on a request object
   *     that contains the error from a failed command.
   */
  public CrossDomainRpcRenderer(String responsePropertyName,
      String errorPropertyName) {
    this.responsePropertyName = getPropertyName(responsePropertyName);
    this.errorPropertyName = getPropertyName(errorPropertyName);
    this.exceptionResult = new JsonErrorExceptionResult(errorPropertyName,
        responsePropertyName);
  }

  private static String getPropertyName(String propertyName) {
    return propertyName.startsWith(":")
        ? propertyName.substring(1)
        : propertyName;
  }

  public void render(HttpServletRequest request, HttpServletResponse response,
      RestishHandler handler) throws Exception {
    Object result = request.getAttribute(responsePropertyName);
    if (result == null) {
      if (request.getAttribute(errorPropertyName) != null) {
        result = exceptionResult.prepareResponseObject(request);
      } else {
        result = createEmtpySuccessResponse(request);
      }
    }
    String renderedResponse = new BeanToJsonConverter().convert(result);

    byte[] data = Charsets.UTF_8.encode(renderedResponse).array();

    // Strip out the null characters, which are not valid JavaScript characters.
    int length = data.length;
    while (data[length - 1] == '\0') {
      length--;
    }

    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/json");
    response.setCharacterEncoding(Charsets.UTF_8.toString());
    response.setContentLength(length);
    response.getOutputStream().write(data);
    response.getOutputStream().flush();
  }

  private Response createEmtpySuccessResponse(HttpServletRequest request) {
    String sessionId = HttpCommandExecutor.getSessionId(request.getRequestURI());

    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(null);
    response.setSessionId(sessionId != null ? sessionId : "");
    return response;
  }
}
