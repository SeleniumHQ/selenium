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

import static com.google.common.net.HttpHeaders.CACHE_CONTROL;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.DriverCommand.ADD_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.ADD_CREDENTIAL;
import static org.openqa.selenium.remote.DriverCommand.ADD_VIRTUAL_AUTHENTICATOR;
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
import static org.openqa.selenium.remote.DriverCommand.GET_CREDENTIALS;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_CONTEXT_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_URL;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION;
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
import static org.openqa.selenium.remote.DriverCommand.GET_TIMEOUTS;
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
import static org.openqa.selenium.remote.DriverCommand.REMOVE_ALL_CREDENTIALS;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_CREDENTIAL;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_VIRTUAL_AUTHENTICATOR;
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
import static org.openqa.selenium.remote.DriverCommand.SET_USER_VERIFIED;
import static org.openqa.selenium.remote.DriverCommand.STATUS;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_CONTEXT;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_NEW_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_PARENT_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_WINDOW;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.internal.Require;
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

    String sessionId = "/session/:sessionId";

    defineCommand(GET_ALL_SESSIONS, get("/sessions"));
    defineCommand(NEW_SESSION, post("/session"));
    defineCommand(GET_CAPABILITIES, get(sessionId));
    defineCommand(QUIT, delete(sessionId));

    defineCommand(GET_SESSION_LOGS, post("/logs"));
    defineCommand(GET_LOG, post(sessionId + "/log"));
    defineCommand(GET_AVAILABLE_LOG_TYPES, get(sessionId + "/log/types"));

    defineCommand(SWITCH_TO_FRAME, post(sessionId + "/frame"));
    defineCommand(SWITCH_TO_PARENT_FRAME, post(sessionId + "/frame/parent"));

    String window = sessionId + "/window";
    defineCommand(CLOSE, delete(window));
    defineCommand(SWITCH_TO_WINDOW, post(window));
    defineCommand(SWITCH_TO_NEW_WINDOW, post(window + "/new"));
    defineCommand(FULLSCREEN_CURRENT_WINDOW, post(window + "/fullscreen"));

    defineCommand(GET_CURRENT_URL, get(sessionId + "/url"));
    defineCommand(GET, post(sessionId + "/url"));
    defineCommand(GO_BACK, post(sessionId + "/back"));
    defineCommand(GO_FORWARD, post(sessionId + "/forward"));
    defineCommand(REFRESH, post(sessionId + "/refresh"));

    defineCommand(SET_ALERT_CREDENTIALS, post(sessionId + "/alert/credentials"));

    defineCommand(SCREENSHOT, get(sessionId + "/screenshot"));
    defineCommand(ELEMENT_SCREENSHOT, get(sessionId + "/element/:id/screenshot"));
    defineCommand(GET_TITLE, get(sessionId + "/title"));

    defineCommand(FIND_ELEMENT, post(sessionId + "/element"));
    defineCommand(FIND_ELEMENTS, post(sessionId + "/elements"));

    String elementId = sessionId + "/element/:id";
    defineCommand(CLICK_ELEMENT, post(elementId + "/click"));
    defineCommand(CLEAR_ELEMENT, post(elementId + "/clear"));
    defineCommand(GET_ELEMENT_VALUE_OF_CSS_PROPERTY, get(elementId + "/css/:propertyName"));
    defineCommand(FIND_CHILD_ELEMENT, post(elementId + "/element"));
    defineCommand(FIND_CHILD_ELEMENTS, post(elementId + "/elements"));
    defineCommand(IS_ELEMENT_ENABLED, get(elementId + "/enabled"));
    defineCommand(ELEMENT_EQUALS, get(elementId + "/equals/:other"));
    defineCommand(GET_ELEMENT_RECT, get(elementId + "/rect"));
    defineCommand(GET_ELEMENT_LOCATION, get(elementId + "/location"));
    defineCommand(GET_ELEMENT_TAG_NAME, get(elementId + "/name"));
    defineCommand(IS_ELEMENT_SELECTED, get(elementId + "/selected"));
    defineCommand(GET_ELEMENT_SIZE, get(elementId + "/size"));
    defineCommand(GET_ELEMENT_TEXT, get(elementId + "/text"));
    defineCommand(SEND_KEYS_TO_ELEMENT, post(elementId + "/value"));

    String cookie = sessionId + "/cookie";
    defineCommand(GET_ALL_COOKIES, get(cookie));
    defineCommand(GET_COOKIE, get(cookie + "/:name"));
    defineCommand(ADD_COOKIE, post(cookie));
    defineCommand(DELETE_ALL_COOKIES, delete(cookie));
    defineCommand(DELETE_COOKIE, delete(cookie + "/:name"));

    String timeouts = sessionId + "/timeouts";
    defineCommand(GET_TIMEOUTS, get(timeouts));
    defineCommand(SET_TIMEOUT, post(timeouts));
    defineCommand(SET_SCRIPT_TIMEOUT, post(timeouts + "/async_script"));
    defineCommand(IMPLICITLY_WAIT, post(timeouts + "/implicit_wait"));

    defineCommand(GET_APP_CACHE_STATUS, get(sessionId + "/application_cache/status"));
    defineCommand(IS_BROWSER_ONLINE, get(sessionId + "/browser_connection"));
    defineCommand(SET_BROWSER_ONLINE, post(sessionId + "/browser_connection"));
    defineCommand(GET_LOCATION, get(sessionId + "/location"));
    defineCommand(SET_LOCATION, post(sessionId + "/location"));

    defineCommand(GET_SCREEN_ORIENTATION, get(sessionId + "/orientation"));
    defineCommand(SET_SCREEN_ORIENTATION, post(sessionId + "/orientation"));
    defineCommand(GET_SCREEN_ROTATION, get(sessionId + "/rotation"));
    defineCommand(SET_SCREEN_ROTATION, post(sessionId + "/rotation"));

    String ime = sessionId + "/ime";
    defineCommand(IME_GET_AVAILABLE_ENGINES, get(ime + "/available_engines"));
    defineCommand(IME_GET_ACTIVE_ENGINE, get(ime + "/active_engine"));
    defineCommand(IME_IS_ACTIVATED, get(ime + "/activated"));
    defineCommand(IME_DEACTIVATE, post(ime + "/deactivate"));
    defineCommand(IME_ACTIVATE_ENGINE, post(ime + "/activate"));

    // Mobile Spec
    defineCommand(GET_NETWORK_CONNECTION, get(sessionId + "/network_connection"));
    defineCommand(SET_NETWORK_CONNECTION, post(sessionId + "/network_connection"));
    defineCommand(SWITCH_TO_CONTEXT, post(sessionId + "/context"));
    defineCommand(GET_CURRENT_CONTEXT_HANDLE, get(sessionId + "/context"));
    defineCommand(GET_CONTEXT_HANDLES, get(sessionId + "/contexts"));

    // Virtual Authenticator API
    String webauthn = sessionId + "/webauthn/authenticator";
    String webauthnId = webauthn + "/:authenticatorId";
    defineCommand(ADD_VIRTUAL_AUTHENTICATOR, post(webauthn));
    defineCommand(REMOVE_VIRTUAL_AUTHENTICATOR, delete(webauthnId));
    defineCommand(ADD_CREDENTIAL, post(webauthnId + "/credential"));
    defineCommand(GET_CREDENTIALS, get(webauthnId + "/credentials"));
    defineCommand(REMOVE_CREDENTIAL, delete(webauthnId + "/credentials/:credentialId"));
    defineCommand(REMOVE_ALL_CREDENTIALS, delete(webauthnId + "/credentials"));
    defineCommand(SET_USER_VERIFIED, post(webauthnId + "/uv"));
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
    nameToSpec.put(Require.nonNull("Name", name), spec);
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
      Require.argument("Session id", sessionId).nonNull("Session ID may not be null for command %s", commandName);
      return sessionId.toString();
    }

    Object value = parameters.get(parameterName);
    Require.argument("Parameter", value).nonNull(
        "Missing required parameter \"%s\" for command %s", parameterName, commandName);
    return Urls.urlEncode(String.valueOf(value));
  }

  protected static class CommandSpec {
    private final HttpMethod method;
    private final String path;
    private final ImmutableList<String> pathSegments;

    private CommandSpec(HttpMethod method, String path) {
      this.method = Require.nonNull("HTTP method", method);
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
