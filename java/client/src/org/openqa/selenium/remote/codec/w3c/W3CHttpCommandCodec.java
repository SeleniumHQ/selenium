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

import static org.openqa.selenium.remote.DriverCommand.ACCEPT_ALERT;
import static org.openqa.selenium.remote.DriverCommand.ACTIONS;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_ACTIONS_STATE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_LOCAL_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_SESSION_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.CLICK;
import static org.openqa.selenium.remote.DriverCommand.DISMISS_ALERT;
import static org.openqa.selenium.remote.DriverCommand.DOUBLE_CLICK;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_ASYNC_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.GET_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.GET_ALERT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_AVAILABLE_LOG_TYPES;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_ATTRIBUTE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_RECT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_KEYS;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_LOG;
import static org.openqa.selenium.remote.DriverCommand.GET_PAGE_SOURCE;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_KEYS;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_WINDOW_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_DISPLAYED;
import static org.openqa.selenium.remote.DriverCommand.MAXIMIZE_CURRENT_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.MOUSE_DOWN;
import static org.openqa.selenium.remote.DriverCommand.MOUSE_UP;
import static org.openqa.selenium.remote.DriverCommand.MOVE_TO;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.SET_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SET_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SET_TIMEOUT;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Resources;

import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.Interaction;
import org.openqa.selenium.interactions.KeyInput;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.codec.AbstractHttpCommandCodec;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;


/**
 * A command codec that adheres to the W3C's WebDriver wire protocol.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public class W3CHttpCommandCodec extends AbstractHttpCommandCodec {

  private final PointerInput mouse = new PointerInput(PointerInput.Kind.MOUSE, "mouse");
  private final KeyInput keyboard = new KeyInput("keyboard");

  public W3CHttpCommandCodec() {
    alias(GET_ELEMENT_ATTRIBUTE, EXECUTE_SCRIPT);
    alias(GET_ELEMENT_LOCATION, GET_ELEMENT_RECT);
    alias(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, EXECUTE_SCRIPT);
    alias(GET_ELEMENT_SIZE, GET_ELEMENT_RECT);
    alias(IS_ELEMENT_DISPLAYED, EXECUTE_SCRIPT);
    alias(SUBMIT_ELEMENT, EXECUTE_SCRIPT);

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute/sync"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute/async"));

    alias(GET_PAGE_SOURCE, EXECUTE_SCRIPT);
    alias(CLEAR_LOCAL_STORAGE, EXECUTE_SCRIPT);
    alias(GET_LOCAL_STORAGE_KEYS, EXECUTE_SCRIPT);
    alias(SET_LOCAL_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(REMOVE_LOCAL_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(GET_LOCAL_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(GET_LOCAL_STORAGE_SIZE, EXECUTE_SCRIPT);
    alias(CLEAR_SESSION_STORAGE, EXECUTE_SCRIPT);
    alias(GET_SESSION_STORAGE_KEYS, EXECUTE_SCRIPT);
    alias(SET_SESSION_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(REMOVE_SESSION_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(GET_SESSION_STORAGE_ITEM, EXECUTE_SCRIPT);
    alias(GET_SESSION_STORAGE_SIZE, EXECUTE_SCRIPT);

    defineCommand(MAXIMIZE_CURRENT_WINDOW, post("/session/:sessionId/window/maximize"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get("/session/:sessionId/window/rect"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post("/session/:sessionId/window/rect"));
    alias(GET_CURRENT_WINDOW_POSITION, GET_CURRENT_WINDOW_SIZE);
    alias(SET_CURRENT_WINDOW_POSITION, SET_CURRENT_WINDOW_SIZE);
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window"));
    defineCommand(GET_WINDOW_HANDLES, get("/session/:sessionId/window/handles"));

    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/alert/accept"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/alert/dismiss"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert/text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert/text"));

    defineCommand(GET_ACTIVE_ELEMENT, get("/session/:sessionId/element/active"));

    defineCommand(ACTIONS, post("/session/:sessionId/actions"));
    defineCommand(CLEAR_ACTIONS_STATE, delete("/session/:sessionId/actions"));

    // Emulate the old Actions API since everyone still likes to call these things.
    alias(CLICK, ACTIONS);
    alias(DOUBLE_CLICK, ACTIONS);
    alias(MOUSE_DOWN, ACTIONS);
    alias(MOUSE_UP, ACTIONS);
    alias(MOVE_TO, ACTIONS);

    defineCommand(GET_LOG, post("/session/:sessionId/se/log"));
    defineCommand(GET_AVAILABLE_LOG_TYPES, get("/session/:sessionId/se/log/types"));
  }

  @Override
  protected Map<String, ?> amendParameters(String name, Map<String, ?> parameters) {
    switch (name) {
      case CLICK:
        return ImmutableMap.<String, Object>builder()
            .put("actions", ImmutableList.of(
                new Sequence(mouse, 0)
                    .addAction(mouse.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                    .addAction(mouse.createPointerUp(PointerInput.MouseButton.LEFT.asArg()))
                    .toJson()))
            .build();

      case DOUBLE_CLICK:
        return ImmutableMap.<String, Object>builder()
            .put("actions", ImmutableList.of(
                new Sequence(mouse, 0)
                    .addAction(mouse.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                    .addAction(mouse.createPointerUp(PointerInput.MouseButton.LEFT.asArg()))
                    .addAction(mouse.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                    .addAction(mouse.createPointerUp(PointerInput.MouseButton.LEFT.asArg()))
                    .toJson()))
            .build();

      case FIND_CHILD_ELEMENT:
      case FIND_CHILD_ELEMENTS:
      case FIND_ELEMENT:
      case FIND_ELEMENTS:
        String using = (String) parameters.get("using");
        String value = (String) parameters.get("value");

        Map<String, Object> toReturn = new HashMap<>(parameters);

        switch (using) {
          case "class name":
            if (value.matches(".*\\s.*")) {
              throw new InvalidSelectorException("Compound class names not permitted");
            }
            toReturn.put("using", "css selector");
            toReturn.put("value", "." + cssEscape(value));
            break;

          case "id":
            toReturn.put("using", "css selector");
            toReturn.put("value", "#" + cssEscape(value));
            break;

          case "link text":
            // Do nothing
            break;

          case "name":
            toReturn.put("using", "css selector");
            toReturn.put("value", "*[name='" + value + "']");
            break;

          case "partial link text":
            // Do nothing
            break;

          case "tag name":
            toReturn.put("using", "css selector");
            toReturn.put("value", cssEscape(value));
            break;

          case "xpath":
            // Do nothing
            break;
        }
        return toReturn;

      case GET_ELEMENT_ATTRIBUTE:
        // Read the atom, wrap it, execute it.
        return executeAtom(
          "getAttribute.js",
          asElement(parameters.get("id")),
          parameters.get("name"));

      case GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW:
        return toScript(
          "var e = arguments[0]; e.scrollIntoView({behavior: 'instant', block: 'end', inline: 'nearest'}); var rect = e.getBoundingClientRect(); return {'x': rect.left, 'y': rect.top};",
          asElement(parameters.get("id")));

      case GET_PAGE_SOURCE:
        return toScript(
          "var source = document.documentElement.outerHTML; \n" +
          "if (!source) { source = new XMLSerializer().serializeToString(document); }\n" +
          "return source;");

      case CLEAR_LOCAL_STORAGE:
        return toScript("localStorage.clear()");

      case GET_LOCAL_STORAGE_KEYS:
        return toScript("return Object.keys(localStorage)");

      case SET_LOCAL_STORAGE_ITEM:
        return toScript("localStorage.setItem(arguments[0], arguments[1])",
                        parameters.get("key"), parameters.get("value"));

      case REMOVE_LOCAL_STORAGE_ITEM:
        return toScript("var item = localStorage.getItem(arguments[0]); localStorage.removeItem(arguments[0]); return item",
                        parameters.get("key"));

      case GET_LOCAL_STORAGE_ITEM:
        return toScript("return localStorage.getItem(arguments[0])", parameters.get("key"));

      case GET_LOCAL_STORAGE_SIZE:
        return toScript("return localStorage.length");

      case CLEAR_SESSION_STORAGE:
        return toScript("sessionStorage.clear()");

      case GET_SESSION_STORAGE_KEYS:
        return toScript("return Object.keys(sessionStorage)");

      case SET_SESSION_STORAGE_ITEM:
        return toScript("sessionStorage.setItem(arguments[0], arguments[1])",
                        parameters.get("key"), parameters.get("value"));

      case REMOVE_SESSION_STORAGE_ITEM:
        return toScript("var item = sessionStorage.getItem(arguments[0]); sessionStorage.removeItem(arguments[0]); return item",
                        parameters.get("key"));

      case GET_SESSION_STORAGE_ITEM:
        return toScript("return sessionStorage.getItem(arguments[0])", parameters.get("key"));

      case GET_SESSION_STORAGE_SIZE:
        return toScript("return sessionStorage.length");

      case IS_ELEMENT_DISPLAYED:
        return executeAtom("isDisplayed.js", asElement(parameters.get("id")));

      case MOUSE_DOWN:
        Interaction mouseDown = mouse.createPointerDown(PointerInput.MouseButton.LEFT.asArg());
        return ImmutableMap.<String, Object>builder()
            .put("actions", ImmutableList.of(new Sequence(mouse, 0).addAction(mouseDown).toJson()))
            .build();

      case MOUSE_UP:
        Interaction mouseUp = mouse.createPointerUp(PointerInput.MouseButton.LEFT.asArg());
        return ImmutableMap.<String, Object>builder()
            .put("actions", ImmutableList.of(new Sequence(mouse, 0).addAction(mouseUp).toJson()))
            .build();

      case MOVE_TO:
        PointerInput.Origin origin = PointerInput.Origin.pointer();
        if (parameters.containsKey("element")) {
          RemoteWebElement element = new RemoteWebElement();
          element.setId((String) parameters.get("element"));
          origin = PointerInput.Origin.fromElement(element);
        }
        int x = parameters.containsKey("xoffset") ? ((Number) parameters.get("xoffset")).intValue() : 0;
        int y = parameters.containsKey("yoffset") ? ((Number) parameters.get("yoffset")).intValue() : 0;

        Interaction mouseMove = mouse.createPointerMove(Duration.ofMillis(200), origin, x, y);
        return ImmutableMap.<String, Object>builder()
            .put("actions", ImmutableList.of(new Sequence(mouse, 0).addAction(mouseMove).toJson()))
            .build();

      case SEND_KEYS_TO_ACTIVE_ELEMENT:
      case SEND_KEYS_TO_ELEMENT:
        // When converted from JSON, this is a list, not an array
        Object rawValue = parameters.get("value");
        Stream<CharSequence> source;
        if (rawValue instanceof Collection) {
          //noinspection unchecked
          source = ((Collection<CharSequence>) rawValue).stream();
        } else {
          source = Stream.of((CharSequence[]) rawValue);
        }

        String text = source
            .flatMap(Stream::of)
            .collect(Collectors.joining());
        return ImmutableMap.<String, Object>builder()
            .putAll(
                parameters.entrySet().stream()
                    .filter(e -> !"text".equals(e.getKey()))
                    .filter(e -> !"value".equals(e.getKey()))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
            .put("text", text)
            .put("value", stringToUtf8Array(text))
            .build();

      case SET_ALERT_VALUE:
        return ImmutableMap.<String, Object>builder()
          .put("text", parameters.get("text"))
          .put("value", stringToUtf8Array((String) parameters.get("text")))
          .build();

      case SET_TIMEOUT:
        String timeoutType = (String) parameters.get("type");
        Number duration = (Number) parameters.get("ms");

        if (timeoutType == null) {
          // Assume a local end that Knows What To Do according to the spec
          return parameters;
        }

        return ImmutableMap.<String, Object>builder()
          .putAll(
            parameters.entrySet().stream()
              .filter(e -> !timeoutType.equals(e.getKey()))
              .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
          .put(timeoutType, duration)
          .build();

      case SUBMIT_ELEMENT:
        return toScript(
          "var form = arguments[0];\n" +
          "while (form.nodeName != \"FORM\" && form.parentNode) {\n" +
          "  form = form.parentNode;\n" +
          "}\n" +
          "if (!form) { throw Error('Unable to find containing form element'); }\n" +
          "if (!form.ownerDocument) { throw Error('Unable to find owning document'); }\n" +
          "var e = form.ownerDocument.createEvent('Event');\n" +
          "e.initEvent('submit', true, true);\n" +
          "if (form.dispatchEvent(e)) { HTMLFormElement.prototype.submit.call(form) }\n",
          asElement(parameters.get("id")));

      default:
        return parameters;
    }
  }

  private List<String> stringToUtf8Array(String toConvert) {
    List<String> toReturn = new ArrayList<>();
    int offset = 0;
    while (offset < toConvert.length()) {
      int next = toConvert.codePointAt(offset);
      toReturn.add(new StringBuilder().appendCodePoint(next).toString());
      offset += Character.charCount(next);
    }
    return toReturn;
  }

  private Map<String, ?> executeAtom(String atomFileName, Object... args) {
    try {
      String scriptName = "/org/openqa/selenium/remote/" + atomFileName;
      URL url = getClass().getResource(scriptName);

      String rawFunction = Resources.toString(url, StandardCharsets.UTF_8);
      String script = String.format(
        "return (%s).apply(null, arguments);",
        rawFunction);
      return toScript(script, args);
    } catch (IOException | NullPointerException e) {
      throw new WebDriverException(e);
    }
  }

  private Map<String, ?> toScript(String script, Object... args) {
    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    List<Object> convertedArgs = Stream.of(args).map(new WebElementToJsonConverter()).collect(
        Collectors.toList());

    return ImmutableMap.of(
      "script", script,
      "args", convertedArgs);
  }

  private Map<String, String> asElement(Object id) {
    return ImmutableMap.of("element-6066-11e4-a52e-4f735466cecf", (String) id);
  }

  private String cssEscape(String using) {
    using = using.replaceAll("([\\s'\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-\\/\\[\\]\\(\\)])", "\\\\$1");
    if (using.length() > 0 && Character.isDigit(using.charAt(0))) {
      using = "\\" + Integer.toString(30 + Integer.parseInt(using.substring(0,1))) + " " + using.substring(1);
    }
    return using;
  }
}
