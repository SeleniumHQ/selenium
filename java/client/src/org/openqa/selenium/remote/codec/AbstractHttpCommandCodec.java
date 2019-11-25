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

package org.openqa.selenium.remote.codec;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.net.HttpHeaders.CACHE_CONTROL;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.DriverCommand.ADD_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLICK_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLOSE;
import static org.openqa.selenium.remote.DriverCommand.DELETE_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.DELETE_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.ELEMENT_EQUALS;
import static org.openqa.selenium.remote.DriverCommand.ELEMENT_SCREENSHOT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FULLSCREEN_CURRENT_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.GET;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_SESSIONS;
import static org.openqa.selenium.remote.DriverCommand.GET_APP_CACHE_STATUS;
import static org.openqa.selenium.remote.DriverCommand.GET_AVAILABLE_LOG_TYPES;
import static org.openqa.selenium.remote.DriverCommand.GET_CAPABILITIES;
import static org.openqa.selenium.remote.DriverCommand.GET_CONTEXT_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.GET_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_CONTEXT_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_URL;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_PROPERTY;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_RECT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TAG_NAME;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_LOG;
import static org.openqa.selenium.remote.DriverCommand.GET_NETWORK_CONNECTION;
import static org.openqa.selenium.remote.DriverCommand.GET_SCREEN_ORIENTATION;
import static org.openqa.selenium.remote.DriverCommand.GET_SCREEN_ROTATION;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_LOGS;
import static org.openqa.selenium.remote.DriverCommand.GET_TITLE;
import static org.openqa.selenium.remote.DriverCommand.GO_BACK;
import static org.openqa.selenium.remote.DriverCommand.GO_FORWARD;
import static org.openqa.selenium.remote.DriverCommand.IME_ACTIVATE_ENGINE;
import static org.openqa.selenium.remote.DriverCommand.IME_DEACTIVATE;
import static org.openqa.selenium.remote.DriverCommand.IME_GET_ACTIVE_ENGINE;
import static org.openqa.selenium.remote.DriverCommand.IME_GET_AVAILABLE_ENGINES;
import static org.openqa.selenium.remote.DriverCommand.IME_IS_ACTIVATED;
import static org.openqa.selenium.remote.DriverCommand.IMPLICITLY_WAIT;
import static org.openqa.selenium.remote.DriverCommand.IS_BROWSER_ONLINE;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_ENABLED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.DriverCommand.REFRESH;
import static org.openqa.selenium.remote.DriverCommand.SCREENSHOT;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_CREDENTIALS;
import static org.openqa.selenium.remote.DriverCommand.SET_BROWSER_ONLINE;
import static org.openqa.selenium.remote.DriverCommand.SET_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.SET_NETWORK_CONNECTION;
import static org.openqa.selenium.remote.DriverCommand.SET_SCREEN_ORIENTATION;
import static org.openqa.selenium.remote.DriverCommand.SET_SCREEN_ROTATION;
import static org.openqa.selenium.remote.DriverCommand.SET_SCRIPT_TIMEOUT;
import static org.openqa.selenium.remote.DriverCommand.SET_TIMEOUT;
import static org.openqa.selenium.remote.DriverCommand.STATUS;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_CONTEXT;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_NEW_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_PARENT_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.UPLOAD_FILE;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A command codec that adheres to the W3C's WebDriver wire protocol.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public abstract class AbstractHttpCommandCodec implements CommandCodec<HttpRequest> {
  private static final Splitter PATH_SPLITTER = Splitter.on('/').omitEmptyStrings();
  private static final String SESSION_ID_PARAM = "sessionId";

  private final ConcurrentHashMap<String, CommandSpec> nameToSpec = new ConcurrentHashMap<>();
  private final Map<String, String> aliases = new HashMap<>();
  private final Json json = new Json();

  public AbstractHttpCommandCodec() {
    defineCommand(STATUS, get("/status"));

    defineCommand(GET_ALL_SESSIONS, get("/sessions"));
    defineCommand(NEW_SESSION, post("/session"));
    defineCommand(GET_CAPABILITIES, get("/session/:sessionId"));
    defineCommand(QUIT, delete("/session/:sessionId"));

    defineCommand(GET_SESSION_LOGS, post("/logs"));
    defineCommand(GET_LOG, post("/session/:sessionId/log"));
    defineCommand(GET_AVAILABLE_LOG_TYPES, get("/session/:sessionId/log/types"));

    defineCommand(SWITCH_TO_FRAME, post("/session/:sessionId/frame"));
    defineCommand(SWITCH_TO_PARENT_FRAME, post("/session/:sessionId/frame/parent"));

    defineCommand(CLOSE, delete("/session/:sessionId/window"));
    defineCommand(SWITCH_TO_WINDOW, post("/session/:sessionId/window"));
    defineCommand(SWITCH_TO_NEW_WINDOW, post("/session/:sessionId/window/new"));

    defineCommand(FULLSCREEN_CURRENT_WINDOW, post("/session/:sessionId/window/fullscreen"));

    defineCommand(GET_CURRENT_URL, get("/session/:sessionId/url"));
    defineCommand(GET, post("/session/:sessionId/url"));
    defineCommand(GO_BACK, post("/session/:sessionId/back"));
    defineCommand(GO_FORWARD, post("/session/:sessionId/forward"));
    defineCommand(REFRESH, post("/session/:sessionId/refresh"));

    defineCommand(SET_ALERT_CREDENTIALS, post("/session/:sessionId/alert/credentials"));

    defineCommand(UPLOAD_FILE, post("/session/:sessionId/file"));
    defineCommand(SCREENSHOT, get("/session/:sessionId/screenshot"));
    defineCommand(ELEMENT_SCREENSHOT, get("/session/:sessionId/element/:id/screenshot"));
    defineCommand(GET_TITLE, get("/session/:sessionId/title"));

    defineCommand(FIND_ELEMENT, post("/session/:sessionId/element"));
    defineCommand(FIND_ELEMENTS, post("/session/:sessionId/elements"));
    defineCommand(GET_ELEMENT_PROPERTY, get("/session/:sessionId/element/:id/property/:name"));
    defineCommand(CLICK_ELEMENT, post("/session/:sessionId/element/:id/click"));
    defineCommand(CLEAR_ELEMENT, post("/session/:sessionId/element/:id/clear"));
    defineCommand(
        GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
        get("/session/:sessionId/element/:id/css/:propertyName"));
    defineCommand(FIND_CHILD_ELEMENT, post("/session/:sessionId/element/:id/element"));
    defineCommand(FIND_CHILD_ELEMENTS, post("/session/:sessionId/element/:id/elements"));
    defineCommand(IS_ELEMENT_ENABLED, get("/session/:sessionId/element/:id/enabled"));
    defineCommand(ELEMENT_EQUALS, get("/session/:sessionId/element/:id/equals/:other"));
    defineCommand(GET_ELEMENT_RECT, get("/session/:sessionId/element/:id/rect"));
    defineCommand(GET_ELEMENT_LOCATION, get("/session/:sessionId/element/:id/location"));
    defineCommand(GET_ELEMENT_TAG_NAME, get("/session/:sessionId/element/:id/name"));
    defineCommand(IS_ELEMENT_SELECTED, get("/session/:sessionId/element/:id/selected"));
    defineCommand(GET_ELEMENT_SIZE, get("/session/:sessionId/element/:id/size"));
    defineCommand(GET_ELEMENT_TEXT, get("/session/:sessionId/element/:id/text"));
    defineCommand(SEND_KEYS_TO_ELEMENT, post("/session/:sessionId/element/:id/value"));

    defineCommand(GET_ALL_COOKIES, get("/session/:sessionId/cookie"));
    defineCommand(GET_COOKIE, get("/session/:sessionId/cookie/:name"));
    defineCommand(ADD_COOKIE, post("/session/:sessionId/cookie"));
    defineCommand(DELETE_ALL_COOKIES, delete("/session/:sessionId/cookie"));
    defineCommand(DELETE_COOKIE, delete("/session/:sessionId/cookie/:name"));

    defineCommand(SET_TIMEOUT, post("/session/:sessionId/timeouts"));
    defineCommand(SET_SCRIPT_TIMEOUT, post("/session/:sessionId/timeouts/async_script"));
    defineCommand(IMPLICITLY_WAIT, post("/session/:sessionId/timeouts/implicit_wait"));

    defineCommand(GET_APP_CACHE_STATUS, get("/session/:sessionId/application_cache/status"));
    defineCommand(IS_BROWSER_ONLINE, get("/session/:sessionId/browser_connection"));
    defineCommand(SET_BROWSER_ONLINE, post("/session/:sessionId/browser_connection"));
    defineCommand(GET_LOCATION, get("/session/:sessionId/location"));
    defineCommand(SET_LOCATION, post("/session/:sessionId/location"));

    defineCommand(GET_SCREEN_ORIENTATION, get("/session/:sessionId/orientation"));
    defineCommand(SET_SCREEN_ORIENTATION, post("/session/:sessionId/orientation"));
    defineCommand(GET_SCREEN_ROTATION, get("/session/:sessionId/rotation"));
    defineCommand(SET_SCREEN_ROTATION, post("/session/:sessionId/rotation"));

    defineCommand(IME_GET_AVAILABLE_ENGINES, get("/session/:sessionId/ime/available_engines"));
    defineCommand(IME_GET_ACTIVE_ENGINE, get("/session/:sessionId/ime/active_engine"));
    defineCommand(IME_IS_ACTIVATED, get("/session/:sessionId/ime/activated"));
    defineCommand(IME_DEACTIVATE, post("/session/:sessionId/ime/deactivate"));
    defineCommand(IME_ACTIVATE_ENGINE, post("/session/:sessionId/ime/activate"));

    // Mobile Spec
    defineCommand(GET_NETWORK_CONNECTION, get("/session/:sessionId/network_connection"));
    defineCommand(SET_NETWORK_CONNECTION, post("/session/:sessionId/network_connection"));
    defineCommand(SWITCH_TO_CONTEXT, post("/session/:sessionId/context"));
    defineCommand(GET_CURRENT_CONTEXT_HANDLE, get("/session/:sessionId/context"));
    defineCommand(GET_CONTEXT_HANDLES, get("/session/:sessionId/contexts"));
  }

  @Override
  public HttpRequest encode(Command command) {
    String name = aliases.getOrDefault(command.getName(), command.getName());
    CommandSpec spec = nameToSpec.get(name);
    if (spec == null) {
      throw new UnsupportedCommandException(command.getName());
    }
    Map<String, ?> parameters = amendParameters(command.getName(), command.getParameters());
    String uri = buildUri(name, command.getSessionId(), parameters, spec);

    HttpRequest request = new HttpRequest(spec.method, uri);

    if (HttpMethod.POST == spec.method) {

      String content = json.toJson(parameters);
      byte[] data = content.getBytes(UTF_8);

      request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
      request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
      request.setContent(bytes(data));
    }

    if (HttpMethod.GET == spec.method) {
      request.setHeader(CACHE_CONTROL, "no-cache");
    }

    return request;
  }

  protected abstract Map<String,?> amendParameters(String name, Map<String, ?> parameters);

  @Override
  public Command decode(final HttpRequest encodedCommand) {
    final String path = Strings.isNullOrEmpty(encodedCommand.getUri())
                        ? "/" : encodedCommand.getUri();
    final ImmutableList<String> parts = ImmutableList.copyOf(PATH_SPLITTER.split(path));
    int minPathLength = Integer.MAX_VALUE;
    CommandSpec spec = null;
    String name = null;
    for (Map.Entry<String, CommandSpec> nameValue : nameToSpec.entrySet()) {
      if ((nameValue.getValue().pathSegments.size() < minPathLength)
          && nameValue.getValue().isFor(encodedCommand.getMethod(), parts)) {
        name = nameValue.getKey();
        spec = nameValue.getValue();
      }
    }
    if (name == null) {
      throw new UnsupportedCommandException(
          encodedCommand.getMethod() + " " + encodedCommand.getUri());
    }
    Map<String, Object> parameters = new HashMap<>();
    spec.parsePathParameters(parts, parameters);

    String content = string(encodedCommand);
    if (!content.isEmpty()) {
      Map<String, Object> tmp = json.toType(content, MAP_TYPE);
      parameters.putAll(tmp);
    }

    SessionId sessionId = null;
    if (parameters.containsKey(SESSION_ID_PARAM)) {
      String id = (String) parameters.remove(SESSION_ID_PARAM);
      if (id != null) {
        sessionId = new SessionId(id);
      }
    }

    return new Command(sessionId, name, parameters);
  }

  /**
   * Defines a new command mapping.
   *
   * @param name The command name.
   * @param method The HTTP method to use for the command.
   * @param pathPattern The URI path pattern for the command. When encoding a command, each
   *     path segment prefixed with a ":" will be replaced with the corresponding parameter
   *     from the encoded command.
   */
  @Override
  public void defineCommand(String name, HttpMethod method, String pathPattern) {
    defineCommand(name, new CommandSpec(method, pathPattern));
  }

  @Override
  public void alias(String commandName, String isAnAliasFor) {
    aliases.put(commandName, isAnAliasFor);
  }

  protected void defineCommand(String name, CommandSpec spec) {
    checkNotNull(name, "null name");
    nameToSpec.put(name, spec);
  }

  protected static CommandSpec delete(String path) {
    return new CommandSpec(HttpMethod.DELETE, path);
  }

  protected static CommandSpec get(String path) {
    return new CommandSpec(HttpMethod.GET, path);
  }

  protected static CommandSpec post(String path) {
    return new CommandSpec(HttpMethod.POST, path);
  }

  private String buildUri(
    String commandName,
    SessionId sessionId,
    Map<String, ?> parameters,
    CommandSpec spec) {
    StringBuilder builder = new StringBuilder();
    for (String part : spec.pathSegments) {
      if (part.isEmpty()) {
        continue;
      }

      builder.append("/");
      if (part.startsWith(":")) {
        builder.append(getParameter(part.substring(1), commandName, sessionId, parameters));
      } else {
        builder.append(part);
      }
    }
    return builder.toString();
  }

  private String getParameter(
    String parameterName,
    String commandName,
    SessionId sessionId,
    Map<String, ?> parameters) {
    if ("sessionId".equals(parameterName)) {
      checkArgument(sessionId != null, "Session ID may not be null for command %s", commandName);
      return sessionId.toString();
    }

    Object value = parameters.get(parameterName);
    checkArgument(value != null,
                  "Missing required parameter \"%s\" for command %s", parameterName, commandName);
    return Urls.urlEncode(String.valueOf(value));
  }

  protected static class CommandSpec {
    private final HttpMethod method;
    private final String path;
    private final ImmutableList<String> pathSegments;

    private CommandSpec(HttpMethod method, String path) {
      this.method = checkNotNull(method, "null method");
      this.path = path;
      this.pathSegments = ImmutableList.copyOf(PATH_SPLITTER.split(path));
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof CommandSpec) {
        CommandSpec that = (CommandSpec) o;
        return this.method.equals(that.method)
               && this.path.equals(that.path);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Objects.hashCode(method, path);
    }

    /**
     * Returns whether this instance matches the provided HTTP request.
     *
     * @param method The request method.
     * @param parts The parsed request path segments.
     * @return Whether this instance matches the request.
     */
    boolean isFor(HttpMethod method, ImmutableList<String> parts) {
      if (!this.method.equals(method)) {
        return false;
      }

      if (parts.size() != this.pathSegments.size()) {
        return false;
      }

      for (int i = 0; i < parts.size(); ++i) {
        String reqPart = parts.get(i);
        String specPart = pathSegments.get(i);
        if (!(specPart.startsWith(":") || specPart.equals(reqPart))) {
          return false;
        }
      }

      return true;
    }

    void parsePathParameters(ImmutableList<String> parts, Map<String, Object> parameters) {
      for (int i = 0; i < parts.size(); ++i) {
        if (pathSegments.get(i).startsWith(":")) {
          parameters.put(pathSegments.get(i).substring(1), parts.get(i));
        }
      }
    }
  }
}
