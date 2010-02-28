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

package org.openqa.selenium.remote;

import static org.openqa.selenium.remote.DriverCommand.*;

import com.google.common.collect.ImmutableMap;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;

import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Map;

public class HttpCommandExecutor implements CommandExecutor {

  private final String remotePath;

  private enum HttpVerb {

    GET() {
      public HttpMethod createMethod(String url) {
        GetMethod getMethod = new GetMethod(url);
        getMethod.setFollowRedirects(true);
        return getMethod;
      }
    },
    POST() {
      public HttpMethod createMethod(String url) {
        return new PostMethod(url);
      }
    },
    DELETE() {
      public HttpMethod createMethod(String url) {
        return new DeleteMethod(url);
      }
    };

    public abstract HttpMethod createMethod(String url);
  }

  private Map<DriverCommand, CommandInfo> nameToUrl;
  private HttpClient client;

  public HttpCommandExecutor(URL addressOfRemoteServer) throws Exception {
    if (addressOfRemoteServer == null) {
      String remoteServer = System.getProperty("webdriver.remote.server");
      addressOfRemoteServer = remoteServer == null ? null : new URL(remoteServer);

      if (addressOfRemoteServer == null)
        throw new IllegalArgumentException("You must specify a remote address to connect to");
    }

    this.remotePath = addressOfRemoteServer.getPath();

    URI uri = new URI(addressOfRemoteServer.toString(), false);
    client = new HttpClient();
    client.getHostConfiguration().setHost(uri);

    nameToUrl = ImmutableMap.<DriverCommand, CommandInfo>builder()
        .put(NEW_SESSION, post("/session"))
        .put(QUIT, delete("/session/:sessionId"))
        .put(GET_CURRENT_WINDOW_HANDLE,
             get("/session/:sessionId/:context/window_handle"))
        .put(GET_WINDOW_HANDLES,
             get("/session/:sessionId/:context/window_handles"))
        .put(GET, post("/session/:sessionId/:context/url"))
        .put(GO_FORWARD, post("/session/:sessionId/:context/forward"))
        .put(GO_BACK, post("/session/:sessionId/:context/back"))
        .put(REFRESH, post("/session/:sessionId/:context/refresh"))
        .put(EXECUTE_SCRIPT, post("/session/:sessionId/:context/execute"))
        .put(GET_CURRENT_URL, get("/session/:sessionId/:context/url"))
        .put(GET_TITLE, get("/session/:sessionId/:context/title"))
        .put(GET_PAGE_SOURCE, get("/session/:sessionId/:context/source"))
        .put(SCREENSHOT, get("/session/:sessionId/:context/screenshot"))
        .put(SET_BROWSER_VISIBLE, post("/session/:sessionId/:context/visible"))
        .put(IS_BROWSER_VISIBLE, get("/session/:sessionId/:context/visible"))
        .put(FIND_ELEMENT, post("/session/:sessionId/:context/element"))
        .put(FIND_ELEMENTS, post("/session/:sessionId/:context/elements"))
        .put(GET_ACTIVE_ELEMENT,
             post("/session/:sessionId/:context/element/active"))
        .put(FIND_CHILD_ELEMENT,
             post("/session/:sessionId/:context/element/:id/element/:using"))
        .put(FIND_CHILD_ELEMENTS,
             post("/session/:sessionId/:context/element/:id/elements/:using"))
        .put(CLICK_ELEMENT, post("/session/:sessionId/:context/element/:id/click"))
        .put(CLEAR_ELEMENT, post("/session/:sessionId/:context/element/:id/clear"))
        .put(SUBMIT_ELEMENT, post("/session/:sessionId/:context/element/:id/submit"))
        .put(GET_ELEMENT_TEXT, get("/session/:sessionId/:context/element/:id/text"))
        .put(SEND_KEYS_TO_ELEMENT, post("/session/:sessionId/:context/element/:id/value"))
        .put(GET_ELEMENT_VALUE, get("/session/:sessionId/:context/element/:id/value"))
        .put(GET_ELEMENT_TAG_NAME, get("/session/:sessionId/:context/element/:id/name"))
        .put(IS_ELEMENT_SELECTED, get("/session/:sessionId/:context/element/:id/selected"))
        .put(SET_ELEMENT_SELECTED, post("/session/:sessionId/:context/element/:id/selected"))
        .put(TOGGLE_ELEMENT, post("/session/:sessionId/:context/element/:id/toggle"))
        .put(IS_ELEMENT_ENABLED, get("/session/:sessionId/:context/element/:id/enabled"))
        .put(IS_ELEMENT_DISPLAYED, get("/session/:sessionId/:context/element/:id/displayed"))
        .put(HOVER_OVER_ELEMENT, post("/session/:sessionId/:context/element/:id/hover"))
        .put(GET_ELEMENT_LOCATION, get("/session/:sessionId/:context/element/:id/location"))
        .put(GET_ELEMENT_SIZE, get("/session/:sessionId/:context/element/:id/size"))
        .put(GET_ELEMENT_ATTRIBUTE,
             get("/session/:sessionId/:context/element/:id/attribute/:name"))
        .put(ELEMENT_EQUALS, get("/session/:sessionId/:context/element/:id/equals/:other"))
        .put(GET_ALL_COOKIES, get("/session/:sessionId/:context/cookie"))
        .put(ADD_COOKIE, post("/session/:sessionId/:context/cookie"))
        .put(DELETE_ALL_COOKIES, delete("/session/:sessionId/:context/cookie"))
        .put(DELETE_COOKIE, delete("/session/:sessionId/:context/cookie/:name"))
        .put(SWITCH_TO_FRAME, post("/session/:sessionId/:context/frame/:id"))
        .put(SWITCH_TO_WINDOW,
             post("/session/:sessionId/:context/window/:name"))
        .put(CLOSE, delete("/session/:sessionId/:context/window"))
        .put(DRAG_ELEMENT,
             post("/session/:sessionId/:context/element/:id/drag"))
        .put(GET_SPEED, get("/session/:sessionId/:context/speed"))
        .put(SET_SPEED, post("/session/:sessionId/:context/speed"))
        .put(GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
             get("/session/:sessionId/:context/element/:id/css/:propertyName"))
        .build();
  }

  public Response execute(Command command) throws Exception {
    CommandInfo info = nameToUrl.get(command.getName());
    HttpMethod httpMethod = info.getMethod(remotePath, command);

    httpMethod.addRequestHeader("Accept", "application/json, image/png");

    String payload = new BeanToJsonConverter().convert(command.getParameters());

    if (httpMethod instanceof PostMethod) {
      ((PostMethod) httpMethod)
          .setRequestEntity(new StringRequestEntity(payload, "application/json", "UTF-8"));
    }

    client.executeMethod(httpMethod);

    // TODO: SimonStewart: 2008-04-25: This is really shabby
    if (isRedirect(httpMethod)) {
      Header newLocation = httpMethod.getResponseHeader("location");
      httpMethod = new GetMethod(newLocation.getValue());
      httpMethod.setFollowRedirects(true);
      httpMethod.addRequestHeader("Accept", "application/json, image/png");
      client.executeMethod(httpMethod);
    }

    return createResponse(httpMethod);
  }

  private Response createResponse(HttpMethod httpMethod) throws Exception {
    Response response;

    Header header = httpMethod.getResponseHeader("Content-Type");

    if (header != null && header.getValue().startsWith("application/json")) {
      response = new JsonToBeanConverter().convert(Response.class, httpMethod.getResponseBodyAsString());
    } else {
      response = new Response();

      if (header != null && header.getValue().startsWith("image/png")) {
        response.setValue(httpMethod.getResponseBody());
      } else {
        response.setValue(httpMethod.getResponseBodyAsString());
      }
      
      String uri = httpMethod.getURI().toString();
      int sessionIndex = uri.indexOf("/session/");
      if (sessionIndex != -1) {
        sessionIndex += "/session/".length();
        int nextSlash = uri.indexOf("/", sessionIndex);
        if (nextSlash != -1) {
          response.setSessionId(uri.substring(sessionIndex, nextSlash));
          response.setContext("foo");
        }
      }
    }
    response.setError(!(httpMethod.getStatusCode() > 199 && httpMethod.getStatusCode() < 300));

    if (response.getValue() instanceof String) {
      //We normalise to \n because Java will translate this to \r\n
      //if this is suitable on our platform, and if we have \r\n, java will
      //turn this into \r\r\n, which would be Bad!
      response.setValue(((String)response.getValue()).replace("\r\n", "\n"));
    }
    
    return response;
  }

  private boolean isRedirect(HttpMethod httpMethod) {
    int code = httpMethod.getStatusCode();
    return (code == 301 || code == 302 || code == 303 || code == 307)
           && httpMethod.getResponseHeader("location") != null;
  }

  private static CommandInfo get(String url) {
    return new CommandInfo(url, HttpVerb.GET);
  }

  private static CommandInfo post(String url) {
    return new CommandInfo(url, HttpVerb.POST);
  }

  private static CommandInfo delete(String url) {
    return new CommandInfo(url, HttpVerb.DELETE);
  }

  private static class CommandInfo {

    private final String url;
    private final HttpVerb verb;

    public CommandInfo(String url, HttpVerb verb) {
      this.url = url;
      this.verb = verb;
    }

    public HttpMethod getMethod(String base, Command command) {
      StringBuilder urlBuilder = new StringBuilder(base);
      for (String part : url.split("/")) {
        if (part.length() == 0) {
          continue;
        }

        urlBuilder.append("/");
        if (part.startsWith(":")) {
          String value = get(part.substring(1), command);
          if (value != null) {
            urlBuilder.append(get(part.substring(1), command));
          }
        } else {
          urlBuilder.append(part);
        }
      }

      return verb.createMethod(urlBuilder.toString());
    }

    @SuppressWarnings("unchecked")
    private String get(String propertyName, Command command) {
      if ("sessionId".equals(propertyName)) {
        return command.getSessionId().toString();
      }
      if ("context".equals(propertyName)) {
        return command.getContext().toString();
      }

      // Attempt to extract the property name from the parameters
      if (command.getParameters().length > 0 && command.getParameters()[0] instanceof Map) {
        Object value = ((Map) command.getParameters()[0]).get(propertyName);
        if (value != null) {
          try {
            return URLEncoder.encode(String.valueOf(value), "UTF-8");
          } catch (UnsupportedEncodingException e) {
            // Can never happen. UTF-8 ships with java
            return String.valueOf(value);
          }
        }
        return null;
      }

      throw new IllegalArgumentException("Cannot determine property: " + propertyName);
    }
  }
}
