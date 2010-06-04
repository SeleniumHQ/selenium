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

import static org.openqa.selenium.remote.DriverCommand.ADD_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLICK_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLOSE;
import static org.openqa.selenium.remote.DriverCommand.DELETE_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.DELETE_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.DRAG_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.ELEMENT_EQUALS;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SQL;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.GET;
import static org.openqa.selenium.remote.DriverCommand.GET_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.GET_APP_CACHE;
import static org.openqa.selenium.remote.DriverCommand.GET_APP_CACHE_STATUS;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_URL;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_ATTRIBUTE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TAG_NAME;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_PAGE_SOURCE;
import static org.openqa.selenium.remote.DriverCommand.GET_SPEED;
import static org.openqa.selenium.remote.DriverCommand.GET_TITLE;
import static org.openqa.selenium.remote.DriverCommand.GET_WINDOW_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.GO_BACK;
import static org.openqa.selenium.remote.DriverCommand.GO_FORWARD;
import static org.openqa.selenium.remote.DriverCommand.HOVER_OVER_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.IMPLICITLY_WAIT;
import static org.openqa.selenium.remote.DriverCommand.IS_BROWSER_ONLINE;
import static org.openqa.selenium.remote.DriverCommand.IS_BROWSER_VISIBLE;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_DISPLAYED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_ENABLED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.DriverCommand.REFRESH;
import static org.openqa.selenium.remote.DriverCommand.SCREENSHOT;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_BROWSER_ONLINE;
import static org.openqa.selenium.remote.DriverCommand.SET_BROWSER_VISIBLE;
import static org.openqa.selenium.remote.DriverCommand.SET_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.SET_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.SET_SPEED;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.TOGGLE_ELEMENT;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Map;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.openqa.selenium.WebDriverException;

import com.google.common.collect.ImmutableMap;

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

  private Map<String, CommandInfo> nameToUrl;
  private HttpClient client;

  public HttpCommandExecutor(URL addressOfRemoteServer) {
    if (addressOfRemoteServer == null) {
      String remoteServer = System.getProperty("webdriver.remote.server");
      if (remoteServer != null) {
        try {
          addressOfRemoteServer = new URL(remoteServer);
        } catch (MalformedURLException e) {
          throw new WebDriverException(e);
        }
      }
      if (addressOfRemoteServer == null)
        throw new IllegalArgumentException("You must specify a remote address to connect to");
    }

    this.remotePath = addressOfRemoteServer.getPath();

    URI uri;
    try {
      uri = new URI(addressOfRemoteServer.toString(), false);
    } catch (URIException e) {
      throw new WebDriverException(e);
    }
    client = new HttpClient();
    client.getHostConfiguration().setHost(uri);

    nameToUrl = ImmutableMap.<String, CommandInfo>builder()
        .put(NEW_SESSION, post("/session"))
        .put(QUIT, delete("/session/:sessionId"))
        .put(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window_handle"))
        .put(GET_WINDOW_HANDLES, get("/session/:sessionId/window_handles"))
        .put(GET, post("/session/:sessionId/url"))
        .put(GO_FORWARD, post("/session/:sessionId/forward"))
        .put(GO_BACK, post("/session/:sessionId/back"))
        .put(REFRESH, post("/session/:sessionId/refresh"))
        .put(EXECUTE_SCRIPT, post("/session/:sessionId/execute"))
        .put(GET_CURRENT_URL, get("/session/:sessionId/url"))
        .put(GET_TITLE, get("/session/:sessionId/title"))
        .put(GET_PAGE_SOURCE, get("/session/:sessionId/source"))
        .put(SCREENSHOT, get("/session/:sessionId/screenshot"))
        .put(SET_BROWSER_VISIBLE, post("/session/:sessionId/visible"))
        .put(IS_BROWSER_VISIBLE, get("/session/:sessionId/visible"))
        .put(FIND_ELEMENT, post("/session/:sessionId/element"))
        .put(FIND_ELEMENTS, post("/session/:sessionId/elements"))
        .put(GET_ACTIVE_ELEMENT, post("/session/:sessionId/element/active"))
        .put(FIND_CHILD_ELEMENT, post("/session/:sessionId/element/:id/element"))
        .put(FIND_CHILD_ELEMENTS, post("/session/:sessionId/element/:id/elements"))
        .put(CLICK_ELEMENT, post("/session/:sessionId/element/:id/click"))
        .put(CLEAR_ELEMENT, post("/session/:sessionId/element/:id/clear"))
        .put(SUBMIT_ELEMENT, post("/session/:sessionId/element/:id/submit"))
        .put(GET_ELEMENT_TEXT, get("/session/:sessionId/element/:id/text"))
        .put(SEND_KEYS_TO_ELEMENT, post("/session/:sessionId/element/:id/value"))
        .put(GET_ELEMENT_VALUE, get("/session/:sessionId/element/:id/value"))
        .put(GET_ELEMENT_TAG_NAME, get("/session/:sessionId/element/:id/name"))
        .put(IS_ELEMENT_SELECTED, get("/session/:sessionId/element/:id/selected"))
        .put(SET_ELEMENT_SELECTED, post("/session/:sessionId/element/:id/selected"))
        .put(TOGGLE_ELEMENT, post("/session/:sessionId/element/:id/toggle"))
        .put(IS_ELEMENT_ENABLED, get("/session/:sessionId/element/:id/enabled"))
        .put(IS_ELEMENT_DISPLAYED, get("/session/:sessionId/element/:id/displayed"))
        .put(HOVER_OVER_ELEMENT, post("/session/:sessionId/element/:id/hover"))
        .put(GET_ELEMENT_LOCATION, get("/session/:sessionId/element/:id/location"))
        .put(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW,
            get("/session/:sessionId/element/:id/location_in_view"))
        .put(GET_ELEMENT_SIZE, get("/session/:sessionId/element/:id/size"))
        .put(GET_ELEMENT_ATTRIBUTE, get("/session/:sessionId/element/:id/attribute/:name"))
        .put(ELEMENT_EQUALS, get("/session/:sessionId/element/:id/equals/:other"))
        .put(GET_ALL_COOKIES, get("/session/:sessionId/cookie"))
        .put(ADD_COOKIE, post("/session/:sessionId/cookie"))
        .put(DELETE_ALL_COOKIES, delete("/session/:sessionId/cookie"))
        .put(DELETE_COOKIE, delete("/session/:sessionId/cookie/:name"))
        .put(SWITCH_TO_FRAME, post("/session/:sessionId/frame"))
        .put(SWITCH_TO_WINDOW, post("/session/:sessionId/window"))
        .put(CLOSE, delete("/session/:sessionId/window"))
        .put(DRAG_ELEMENT, post("/session/:sessionId/element/:id/drag"))
        .put(GET_SPEED, get("/session/:sessionId/speed"))
        .put(SET_SPEED, post("/session/:sessionId/speed"))
        .put(GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
             get("/session/:sessionId/element/:id/css/:propertyName"))
        .put(IMPLICITLY_WAIT, post("/session/:sessionId/timeouts/implicit_wait"))
        .put(EXECUTE_SQL, post("/session/:sessionId/execute_sql"))
        .put(GET_LOCATION, get("/session/:sessionId/location"))
        .put(SET_LOCATION, post("/session/:sessionId/location"))
        .put(GET_APP_CACHE, get("/session/:sessionId/application_cache"))
        .put(GET_APP_CACHE_STATUS, get("/session/:sessionId/application_cache/status"))
        .put(IS_BROWSER_ONLINE, get("/session/:sessionId/browser_connection"))
        .put(SET_BROWSER_ONLINE, post("/session/:sessionId/browser_connection"))
        .build();
  }

  public URL getAddressOfRemoteServer() {
    try {
      return new URL(client.getHostConfiguration().getHostURL());
    } catch (MalformedURLException e) {
      // This really should never happen.
      throw new WebDriverException(e);
    }
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
        }
      }
    }

    if (!(httpMethod.getStatusCode() > 199 && httpMethod.getStatusCode() < 300)) {
      // 4xx represents an unknown command or a bad request.
      if (httpMethod.getStatusCode() > 399 && httpMethod.getStatusCode() < 500) {
        response.setStatus(ErrorCodes.UNKNOWN_COMMAND);
      } else if (httpMethod.getStatusCode() > 499 && httpMethod.getStatusCode() < 600) {
        // 5xx represents an internal server error. The response status should already be set, but
        // if not, set it to a general error code.
        if (response.getStatus() == ErrorCodes.SUCCESS) {
          response.setStatus(ErrorCodes.UNHANDLED_ERROR);
        }
      } else {
        response.setStatus(ErrorCodes.UNHANDLED_ERROR);
      }
    }


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

    private String get(String propertyName, Command command) {
      if ("sessionId".equals(propertyName)) {
        return command.getSessionId().toString();
      }

      // Attempt to extract the property name from the parameters
      Object value = command.getParameters().get(propertyName);
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
  }
}
