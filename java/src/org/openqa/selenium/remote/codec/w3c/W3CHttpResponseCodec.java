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

import static java.net.HttpURLConnection.HTTP_BAD_GATEWAY;
import static java.net.HttpURLConnection.HTTP_GATEWAY_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.json.Json.OBJECT_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodec;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToWebElementConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.codec.AbstractHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpHeader;
import org.openqa.selenium.remote.http.HttpResponse;

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

  private static final Logger LOG = Logger.getLogger(W3CHttpResponseCodec.class.getName());

  private final ErrorCodec errorCodec = ErrorCodec.createDefault();
  private final ErrorCodes errorCodes = new ErrorCodes();
  private final Json json = new Json();
  private final Function<Object, Object> elementConverter = new JsonToWebElementConverter(null);

  @Override
  public Response decode(HttpResponse encodedResponse) {
    String content = string(encodedResponse).trim();
    LOG.log(
        Level.FINER,
        "Decoding response. Response code was: {0} and content: {1}",
        new Object[] {encodedResponse.getStatus(), content});
    String contentType =
        Objects.requireNonNullElse(encodedResponse.getHeader(HttpHeader.ContentType.getName()), "");

    Response response = new Response();

    // Are we dealing with an error?
    // {"error":"no such alert","message":"No tab modal was open when attempting to get the dialog
    // text"}
    if (!encodedResponse.isSuccessful()) {
      LOG.fine("Processing an error");
      if (HTTP_GATEWAY_TIMEOUT == encodedResponse.getStatus()
          || HTTP_BAD_GATEWAY == encodedResponse.getStatus()) {
        response.setState("unknown error");
        response.setStatus(ErrorCodes.UNHANDLED_ERROR);
        response.setValue(
            new WebDriverException("http gateway error: " + encodedResponse.getStatus()));
      } else {
        Map<String, Object> org = json.toType(content, MAP_TYPE);
        Map<String, Object> obj;

        Object w3cWrappedValue = org.get("value");
        if (w3cWrappedValue instanceof Map && ((Map<?, ?>) w3cWrappedValue).containsKey("error")) {
          //noinspection unchecked
          obj = (Map<String, Object>) w3cWrappedValue;
        } else {
          obj = org;
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
        if ("unexpected alert open".equals(error)
            && HTTP_INTERNAL_ERROR == encodedResponse.getStatus()) {
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
          response.setValue(errorCodec.decode(org));
        }
      }
      return response;
    }

    response.setState("success");
    response.setStatus(ErrorCodes.SUCCESS);
    if (!content.isEmpty()) {
      if (contentType.startsWith("application/json")) {
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
    Object value = response.getValue();
    if (value instanceof WebDriverException) {
      value = errorCodec.encode((WebDriverException) value);
    }
    return Map.of("value", value);
  }

  @Override
  protected Response reconstructValue(Response response) {
    response.setValue(elementConverter.apply(response.getValue()));
    return response;
  }
}
