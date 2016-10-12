// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.http;

import static com.google.common.base.Strings.nullToEmpty;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.net.HttpURLConnection.HTTP_OK;

import com.google.common.base.Strings;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import java.lang.reflect.Constructor;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * A response codec that adheres to the W3C WebDriver wire protocol.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public class W3CHttpResponseCodec extends AbstractHttpResponseCodec {

  // Commands that need special handling:
  // * Get Window Size
  // * Set Window Size
  // * Get Window Position
  // * Set Window Position
  // * Maximise Window
  // * Full screen window
  // * Get Active Element
  // * Possibly find element
  // * Get Element Rect
  // * Get Page Source
  // * Get All Cookies
  // * Get Named Cookie
  // I've not checked the actions apis yet

  private static final Logger log = Logger.getLogger(W3CHttpResponseCodec.class.getName());

  private final ErrorCodes errorCodes = new ErrorCodes();
  private final JsonToBeanConverter jsonToBeanConverter = new JsonToBeanConverter();

  @Override
  public Response decode(HttpResponse encodedResponse) {
    String content = encodedResponse.getContentString().trim();
    log.fine(String.format(
      "Decoding response. Response code was: %d and content: %s",
      encodedResponse.getStatus(),
      content));
    String contentType = nullToEmpty(encodedResponse.getHeader(CONTENT_TYPE));

    Response response = new Response();

    // Are we dealing with an error?
    // {"error":"no such alert","message":"No tab modal was open when attempting to get the dialog text"}
    if (HTTP_OK != encodedResponse.getStatus()) {
      log.fine("Processing an error");
      JsonObject obj = new JsonParser().parse(content).getAsJsonObject();

      String message = "An unknown error has occurred";
      if (obj.has("message")) {
        message = obj.get("message").getAsString();
      }

      String error = "unknown error";
      if (obj.has("error")) {
        error = obj.get("error").getAsString();
      }

      response.setState(error);
      response.setStatus(errorCodes.toStatus(error, Optional.of(encodedResponse.getStatus())));
      response.setValue(createException(error, message));
      return response;
    }

    response.setState("success");
    response.setStatus(ErrorCodes.SUCCESS);
    if (encodedResponse.getContent().length > 0) {
      if (contentType.startsWith("application/json") || Strings.isNullOrEmpty("")) {
        JsonObject parsed = new JsonParser().parse(content).getAsJsonObject();
        if (parsed.has("value")) {
          Object value = jsonToBeanConverter.convert(Object.class, parsed.get("value"));
          response.setValue(value);
        } else {
          // Assume that the body of the response was the response.
          response.setValue(jsonToBeanConverter.convert(Object.class, content));
        }
      }
    }

    if (response.getValue() instanceof String) {
      // We normalise to \n because Java will translate this to \r\n
      // if this is suitable on our platform, and if we have \r\n, java will
      // turn this into \r\r\n, which would be Bad!
      response.setValue(((String) response.getValue()).replace("\r\n", "\n"));
    }

    return response;
  }

  private WebDriverException createException(String error, String message) {
    Class<? extends WebDriverException> clazz = errorCodes.getExceptionType(error);

    try {
      Constructor<? extends WebDriverException> constructor = clazz.getConstructor(String.class);
      return constructor.newInstance(message);
    } catch (ReflectiveOperationException e) {
      throw new WebDriverException(message);
    }
  }
}
