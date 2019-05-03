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

package org.openqa.selenium.remote.codec.w3c;

import static com.google.common.base.Strings.nullToEmpty;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.json.Json.OBJECT_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;

import com.google.common.base.Strings;
import com.google.common.base.Throwables;

import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.codec.AbstractHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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
  private final Json json = new Json();
  private final Function<Object, Object> elementConverter = new JsonToWebElementConverter(null);

  @Override
  public Response decode(HttpResponse encodedResponse) {
    String content = string(encodedResponse).trim();
    log.finest(String.format(
      "Decoding response. Response code was: %d and content: %s",
      encodedResponse.getStatus(),
      content));
    String contentType = nullToEmpty(encodedResponse.getHeader(CONTENT_TYPE));

    Response response = new Response();

    // Are we dealing with an error?
    // {"error":"no such alert","message":"No tab modal was open when attempting to get the dialog text"}
    if (HTTP_OK != encodedResponse.getStatus()) {
      log.fine("Processing an error");
      Map<String, Object> obj = json.toType(content, MAP_TYPE);


      Object w3cWrappedValue = obj.get("value");
      if (w3cWrappedValue instanceof Map && ((Map<?, ?>) w3cWrappedValue).containsKey("error")) {
        //noinspection unchecked
        obj = (Map<String, Object>) w3cWrappedValue;
      }

      String message = "An unknown error has occurred";
      if (obj.get("message") instanceof String) {
        message = (String) obj.get("message");
      }

      String error = "unknown error";
      if (obj.get("error") instanceof String) {
        error = (String) obj.get("error");
      }

      response.setState(error);
      response.setStatus(errorCodes.toStatus(error, Optional.of(encodedResponse.getStatus())));

      // For now, we'll inelegantly special case unhandled alerts.
      if ("unexpected alert open".equals(error) &&
          HTTP_INTERNAL_ERROR == encodedResponse.getStatus()) {
        String text = "";
        Object data = obj.get("data");
        if (data != null) {
          Object rawText = ((Map<?, ?>) data).get("text");
          if (rawText instanceof String) {
            text = (String) rawText;
          }
        }
        response.setValue(new UnhandledAlertException(message, text));
      } else {
        response.setValue(createException(error, message));
      }
      return response;
    }

    response.setState("success");
    response.setStatus(ErrorCodes.SUCCESS);
    if (!content.isEmpty()) {
      if (contentType.startsWith("application/json") || Strings.isNullOrEmpty("")) {
        Map<String, Object> parsed = json.toType(content, MAP_TYPE);
        if (parsed.containsKey("value")) {
          Object value = parsed.get("value");
          response.setValue(value);
        } else {
          // Assume that the body of the response was the response.
          response.setValue(json.toType(content, OBJECT_TYPE));
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

  @Override
  protected Object getValueToEncode(Response response) {
    HashMap<Object, Object> toReturn = new HashMap<>();
    Object value = response.getValue();
    if (value instanceof WebDriverException) {
      HashMap<Object, Object> exception = new HashMap<>();
      exception.put(
          "error",
          response.getState() != null ?
          response.getState() :
          errorCodes.toState(response.getStatus()));
      exception.put("message", ((WebDriverException) value).getMessage());
      exception.put("stacktrace", Throwables.getStackTraceAsString((WebDriverException) value));
      if (value instanceof UnhandledAlertException) {
        HashMap<String, Object> data = new HashMap<>();
        data.put("text", ((UnhandledAlertException) value).getAlertText());
        exception.put("data", data);
      }

      value = exception;
    }
    toReturn.put("value", value);
    return toReturn;
  }

  @Override
  protected Response reconstructValue(Response response) {
    response.setValue(elementConverter.apply(response.getValue()));
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
