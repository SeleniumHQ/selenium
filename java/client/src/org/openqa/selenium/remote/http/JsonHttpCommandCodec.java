package org.openqa.selenium.remote.http;

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.net.HttpHeaders.CACHE_CONTROL;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.openqa.selenium.remote.DriverCommand.*;

import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.BiMap;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.HashBiMap;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.CommandCodec;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A command codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://code.google.com/p/selenium/wiki/JsonWireProtocol">
 *   JSON wire protocol</a>
 */
public class JsonHttpCommandCodec implements CommandCodec<HttpRequest> {

  private static final Splitter PATH_SPLITTER = Splitter.on('/').omitEmptyStrings();
  private static final String SESSION_ID_PARAM = "sessionId";

  private final BiMap<String, CommandSpec> nameToSpec = HashBiMap.create();
  private final BeanToJsonConverter beanToJsonConverter = new BeanToJsonConverter();
  private final JsonToBeanConverter jsonToBeanConverter = new JsonToBeanConverter();

  public JsonHttpCommandCodec() {
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
    defineCommand(MAXIMIZE_WINDOW, post("/session/:sessionId/window/:windowHandle/maximize"));
    defineCommand(GET_WINDOW_SIZE, get("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(SET_WINDOW_SIZE, post("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(GET_WINDOW_POSITION, get("/session/:sessionId/window/:windowHandle/position"));
    defineCommand(SET_WINDOW_POSITION, post("/session/:sessionId/window/:windowHandle/position"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window_handle"));
    defineCommand(GET_WINDOW_HANDLES, get("/session/:sessionId/window_handles"));

    defineCommand(GET_CURRENT_URL, get("/session/:sessionId/url"));
    defineCommand(GET, post("/session/:sessionId/url"));
    defineCommand(GO_BACK, post("/session/:sessionId/back"));
    defineCommand(GO_FORWARD, post("/session/:sessionId/forward"));
    defineCommand(REFRESH, post("/session/:sessionId/refresh"));

    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/accept_alert"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert_text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert_text"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute_async"));

    defineCommand(UPLOAD_FILE, post("/session/:sessionId/file"));
    defineCommand(SCREENSHOT, get("/session/:sessionId/screenshot"));
    defineCommand(GET_PAGE_SOURCE, get("/session/:sessionId/source"));
    defineCommand(GET_TITLE, get("/session/:sessionId/title"));

    defineCommand(FIND_ELEMENT, post("/session/:sessionId/element"));
    defineCommand(FIND_ELEMENTS, post("/session/:sessionId/elements"));
    defineCommand(GET_ACTIVE_ELEMENT, post("/session/:sessionId/element/active"));
    defineCommand(GET_ELEMENT_ATTRIBUTE, get("/session/:sessionId/element/:id/attribute/:name"));
    defineCommand(CLICK_ELEMENT, post("/session/:sessionId/element/:id/click"));
    defineCommand(CLEAR_ELEMENT, post("/session/:sessionId/element/:id/clear"));
    defineCommand(
        GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
        get("/session/:sessionId/element/:id/css/:propertyName"));
    defineCommand(IS_ELEMENT_DISPLAYED, get("/session/:sessionId/element/:id/displayed"));
    defineCommand(FIND_CHILD_ELEMENT, post("/session/:sessionId/element/:id/element"));
    defineCommand(FIND_CHILD_ELEMENTS, post("/session/:sessionId/element/:id/elements"));
    defineCommand(IS_ELEMENT_ENABLED, get("/session/:sessionId/element/:id/enabled"));
    defineCommand(ELEMENT_EQUALS, get("/session/:sessionId/element/:id/equals/:other"));
    defineCommand(GET_ELEMENT_LOCATION, get("/session/:sessionId/element/:id/location"));
    defineCommand(
        GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW,
        get("/session/:sessionId/element/:id/location_in_view"));
    defineCommand(GET_ELEMENT_TAG_NAME, get("/session/:sessionId/element/:id/name"));
    defineCommand(IS_ELEMENT_SELECTED, get("/session/:sessionId/element/:id/selected"));
    defineCommand(GET_ELEMENT_SIZE, get("/session/:sessionId/element/:id/size"));
    defineCommand(SUBMIT_ELEMENT, post("/session/:sessionId/element/:id/submit"));
    defineCommand(GET_ELEMENT_TEXT, get("/session/:sessionId/element/:id/text"));
    defineCommand(SEND_KEYS_TO_ELEMENT, post("/session/:sessionId/element/:id/value"));

    defineCommand(GET_ALL_COOKIES, get("/session/:sessionId/cookie"));
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

    defineCommand(CLEAR_LOCAL_STORAGE, delete("/session/:sessionId/local_storage"));
    defineCommand(GET_LOCAL_STORAGE_KEYS, get("/session/:sessionId/local_storage"));
    defineCommand(SET_LOCAL_STORAGE_ITEM, post("/session/:sessionId/local_storage"));
    defineCommand(REMOVE_LOCAL_STORAGE_ITEM, delete("/session/:sessionId/local_storage/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_ITEM, get("/session/:sessionId/local_storage/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_SIZE, get("/session/:sessionId/local_storage/size"));

    defineCommand(CLEAR_SESSION_STORAGE, delete("/session/:sessionId/session_storage"));
    defineCommand(GET_SESSION_STORAGE_KEYS, get("/session/:sessionId/session_storage"));
    defineCommand(SET_SESSION_STORAGE_ITEM, post("/session/:sessionId/session_storage"));
    defineCommand(
        REMOVE_SESSION_STORAGE_ITEM, delete("/session/:sessionId/session_storage/key/:key"));
    defineCommand(GET_SESSION_STORAGE_ITEM, get("/session/:sessionId/session_storage/key/:key"));
    defineCommand(GET_SESSION_STORAGE_SIZE, get("/session/:sessionId/session_storage/size"));

    defineCommand(GET_SCREEN_ORIENTATION, get("/session/:sessionId/orientation"));
    defineCommand(SET_SCREEN_ORIENTATION, post("/session/:sessionId/orientation"));

    // Interactions-related commands.
    defineCommand(MOUSE_DOWN, post("/session/:sessionId/buttondown"));
    defineCommand(MOUSE_UP, post("/session/:sessionId/buttonup"));
    defineCommand(CLICK, post("/session/:sessionId/click"));
    defineCommand(DOUBLE_CLICK, post("/session/:sessionId/doubleclick"));
    defineCommand(MOVE_TO, post("/session/:sessionId/moveto"));
    defineCommand(SEND_KEYS_TO_ACTIVE_ELEMENT, post("/session/:sessionId/keys"));
    defineCommand(TOUCH_SINGLE_TAP, post("/session/:sessionId/touch/click"));
    defineCommand(TOUCH_DOUBLE_TAP, post("/session/:sessionId/touch/doubleclick"));
    defineCommand(TOUCH_DOWN, post("/session/:sessionId/touch/down"));
    defineCommand(TOUCH_FLICK, post("/session/:sessionId/touch/flick"));
    defineCommand(TOUCH_LONG_PRESS, post("/session/:sessionId/touch/longclick"));
    defineCommand(TOUCH_MOVE, post("/session/:sessionId/touch/move"));
    defineCommand(TOUCH_SCROLL, post("/session/:sessionId/touch/scroll"));
    defineCommand(TOUCH_UP, post("/session/:sessionId/touch/up"));

    defineCommand(IME_GET_AVAILABLE_ENGINES, get("/session/:sessionId/ime/available_engines"));
    defineCommand(IME_GET_ACTIVE_ENGINE, get("/session/:sessionId/ime/active_engine"));
    defineCommand(IME_IS_ACTIVATED, get("/session/:sessionId/ime/activated"));
    defineCommand(IME_DEACTIVATE, post("/session/:sessionId/ime/deactivate"));
    defineCommand(IME_ACTIVATE_ENGINE, post("/session/:sessionId/ime/activate"));

    // Mobile Spec
    // https://code.google.com/p/selenium/source/browse/spec-draft.md?repo=mobile
    defineCommand(GET_NETWORK_CONNECTION, get("/session/:sessionId/network_connection"));
    defineCommand(SET_NETWORK_CONNECTION, post("/session/:sessionId/network_connection"));
    defineCommand(SWITCH_TO_CONTEXT, post("/session/:sessionId/context"));
    defineCommand(GET_CURRENT_CONTEXT_HANDLE, get("/session/:sessionId/context"));
    defineCommand(GET_CONTEXT_HANDLES, get("/session/:sessionId/contexts"));
  }

  @Override
  public HttpRequest encode(Command command) {
    CommandSpec spec = nameToSpec.get(command.getName());
    if (spec == null) {
      throw new UnsupportedCommandException(command.getName());
    }
    String uri = buildUri(command, spec);

    HttpRequest request = new HttpRequest(spec.method, uri);

    if (HttpMethod.POST == spec.method) {
      String content = beanToJsonConverter.convert(command.getParameters());
      byte[] data = content.getBytes(UTF_8);

      request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
      request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
      request.setContent(data);
    }

    if (HttpMethod.GET == spec.method) {
      request.setHeader(CACHE_CONTROL, "no-cache");
    }

    return request;
  }

  @Override
  public Command decode(final HttpRequest encodedCommand) {
    final String path = Strings.isNullOrEmpty(encodedCommand.getUri())
                        ? "/" : encodedCommand.getUri();
    final ImmutableList<String> parts = ImmutableList.copyOf(PATH_SPLITTER.split(path));
    List<CommandSpec> matchingSpecs = FluentIterable.from(nameToSpec.inverse().keySet())
        .filter(new Predicate<CommandSpec>() {
          @Override
          public boolean apply(CommandSpec spec) {
            return spec.isFor(encodedCommand.getMethod(), parts);
          }
        })
        .toSortedList(new Comparator<CommandSpec>() {
          @Override
          public int compare(CommandSpec a, CommandSpec b) {
            return a.pathSegments.size() - b.pathSegments.size();
          }
        });

    if (matchingSpecs.isEmpty()) {
      throw new UnsupportedCommandException(
          encodedCommand.getMethod() + " " + encodedCommand.getUri());
    }
    CommandSpec spec = matchingSpecs.get(0);

    Map<String, Object> parameters = Maps.newHashMap();
    spec.parsePathParameters(parts, parameters);

    String content = encodedCommand.getContentString();
    if (!content.isEmpty()) {
      @SuppressWarnings("unchecked")
      HashMap<String, ?> tmp = jsonToBeanConverter.convert(HashMap.class, content);
      parameters.putAll(tmp);
    }

    String name = nameToSpec.inverse().get(spec);
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
  public void defineCommand(String name, HttpMethod method, String pathPattern) {
    defineCommand(name, new CommandSpec(method, pathPattern));
  }

  private void defineCommand(String name, CommandSpec spec) {
    checkNotNull(name, "null name");
    nameToSpec.put(name, spec);
  }

  private static CommandSpec delete(String path) {
    return new CommandSpec(HttpMethod.DELETE, path);
  }

  private static CommandSpec get(String path) {
    return new CommandSpec(HttpMethod.GET, path);
  }

  private static CommandSpec post(String path) {
    return new CommandSpec(HttpMethod.POST, path);
  }

  private String buildUri(Command command, CommandSpec spec) {
    StringBuilder builder = new StringBuilder();
    for (String part : spec.pathSegments) {
      if (part.isEmpty()) {
        continue;
      }

      builder.append("/");
      if (part.startsWith(":")) {
        builder.append(getParameter(part.substring(1), command));
      } else {
        builder.append(part);
      }
    }
    return builder.toString();
  }

  private String getParameter(String parameterName, Command command) {
    if ("sessionId".equals(parameterName)) {
      SessionId id = command.getSessionId();
      checkArgument(id != null, "Session ID may not be null for command %s", command.getName());
      return id.toString();
    }

    Object value = command.getParameters().get(parameterName);
    checkArgument(value != null,
                  "Missing required parameter \"%s\" for command %s", parameterName, command.getName());
    return Urls.urlEncode(String.valueOf(value));
  }

  private static class CommandSpec {
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
