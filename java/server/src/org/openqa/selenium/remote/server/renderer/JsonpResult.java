package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.Renderer;

import com.google.common.base.Charsets;
import org.json.JSONArray;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Renders an HTTP response for a JSONP client.
 */
public class JsonpResult implements Renderer {

  private final String responsePropertyName;
  private final String callbackPropertyName;
  private final JsonErrorExceptionResult exceptionResult;

  /**
   * Creates a new JSONP renderer.
   *
   * @param responsePropertyName The name of the property on a request object
   *     that contains the response to send to the client.
   * @param errorPropertyName The name of the property on a request object
   *     that contains the error from a failed command.
   * @param callbackPropertyName The name of the property on a request object
   *     that defines the global JavaScripot function that should be invoked in
   *     the rendered response.
   */
  public JsonpResult(String responsePropertyName, String errorPropertyName,
      String callbackPropertyName) {
    this.callbackPropertyName = callbackPropertyName;
    this.responsePropertyName = responsePropertyName.startsWith(":")
        ? responsePropertyName.substring(1)
        : responsePropertyName;
    this.exceptionResult = new JsonErrorExceptionResult(errorPropertyName,
        responsePropertyName);
  }

  public void render(HttpServletRequest request, HttpServletResponse response,
      Handler handler) throws Exception {
    Object result = request.getAttribute(responsePropertyName);
    if (result == null) {
      result = exceptionResult.prepareResponseObject(request);
    }

    // Hack to make sure the output string is properly quoted.
    result = new BeanToJsonConverter().convert(result);

    String quoted = new JSONArray().put(result).toString();
    quoted = quoted.substring(1, quoted.length() - 1);  // Strip [] characters.

    String renderedResponse = String.format("%s(%s);\n",
        request.getAttribute(callbackPropertyName), quoted);

    byte[] data = Charsets.UTF_8.encode(renderedResponse).array();

    // Strip out the null characters, which are not valid JavaScript characters.
    int length = data.length;
    while (data[length - 1] == '\0') {
      length--;
    }

    response.setContentType("text/javascript");
    response.setCharacterEncoding(Charsets.UTF_8.toString());
    response.setContentLength(length);
    response.getOutputStream().write(data);
    response.getOutputStream().flush();
  }
}
