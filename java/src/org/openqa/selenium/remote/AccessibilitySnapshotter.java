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

package org.openqa.selenium.remote;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.AccessibilityNode;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.CallFunctionParameters;
import org.openqa.selenium.bidi.script.ContextTarget;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultExceptionValue;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.LocalValue;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.bidi.script.SerializationOptions;
import org.openqa.selenium.bidi.script.WindowProxyProperties;
import org.openqa.selenium.io.Read;
import org.openqa.selenium.json.Json;

/**
 * Takes accessibility snapshots for one BiDi session: runs the atom's wire entry in the sandbox
 * realm of each document and stitches child frames into the tree. The atom hands the tree back as
 * one JSON string beside the element and frame references, so this class only maps references and
 * recurses into frames.
 */
class AccessibilitySnapshotter {

  private static final Logger LOG = Logger.getLogger(AccessibilitySnapshotter.class.getName());

  /** The sandbox realm the atom runs in: page scripts cannot reach its prototypes. */
  private static final String SANDBOX = "selenium";

  private static final String STALE_MESSAGE =
      "the snapshot root is no longer attached to a document";

  private static final Json JSON = new Json();

  private static volatile @Nullable String atomSource;

  private final RemoteWebDriver driver;
  private final BiDi bidi;
  private final Script script;

  @SuppressWarnings("deprecation")
  AccessibilitySnapshotter(RemoteWebDriver driver) {
    this.driver = driver;
    this.bidi = driver.getBiDi();
    this.script = new Script(driver);
  }

  /**
   * Snapshots the whole page, or the subtree under {@code root}.
   *
   * @param root the element whose subtree to snapshot, or {@code null} for the page of the current
   *     window's top-level browsing context
   * @return the snapshot, with every reachable child frame's tree attached under its {@code iframe}
   *     node
   * @throws StaleElementReferenceException when {@code root} no longer belongs to a document
   */
  AccessibilityNode snapshot(@Nullable RemoteWebElement root) {
    String top = driver.getWindowHandle();
    if (root == null) {
      AccessibilityNode node = snapshotContext(top, null);
      if (node == null) {
        throw new WebDriverException("accessibility snapshot: the script returned nothing");
      }
      return node;
    }
    // The element may live in any frame of the window. Chromium resolves its shared id only in
    // the document that owns it; Firefox resolves it in any document of the browsing context
    // group, so the atom checks ownership itself and each context is tried until the owner is
    // found.
    for (String context : contexts(top)) {
      try {
        AccessibilityNode node = snapshotContext(context, root.getId());
        if (node != null) {
          return node;
        }
      } catch (NotOwned ignored) {
        // Try the next context.
      }
    }
    throw new StaleElementReferenceException(STALE_MESSAGE);
  }

  /**
   * Builds the node tree from the atom's wire form.
   *
   * @param data the parsed JSON of the tree: the node's fields, with {@code element} an index into
   *     {@code elements} and, on a frame node, {@code frame} an index the binding resolves to the
   *     frame's own tree
   * @param elements the elements the tree references, in the atom's order
   * @param frameChildren the children of a frame node, from its {@code frame} index: the frame's
   *     document, or nothing when it cannot be reached
   * @return the node, with its subtree
   */
  @SuppressWarnings("unchecked")
  static AccessibilityNode fromWire(
      Map<String, Object> data,
      List<? extends WebElement> elements,
      Function<Integer, List<AccessibilityNode>> frameChildren) {
    List<AccessibilityNode> children = new ArrayList<>();
    if (data.containsKey("frame")) {
      children.addAll(frameChildren.apply(index(data.get("frame"))));
    } else {
      for (Object child : (List<Object>) data.get("children")) {
        children.add(fromWire((Map<String, Object>) child, elements, frameChildren));
      }
    }
    Map<String, Object> states = new LinkedHashMap<>((Map<String, Object>) data.get("states"));
    Object element = data.get("element");
    Object description = data.get("description");
    Object value = data.get("value");
    return new AccessibilityNode(
        (String) data.get("role"),
        (String) data.get("name"),
        description == null ? "" : (String) description,
        value == null ? null : (String) value,
        states,
        element == null ? null : elements.get(index(element)),
        children);
  }

  private static int index(Object value) {
    return ((Number) value).intValue();
  }

  /** The snapshot of {@code context}, or {@code null} when another document owns the root. */
  private @Nullable AccessibilityNode snapshotContext(String context, @Nullable String rootId) {
    List<LocalValue> arguments =
        rootId == null
            ? List.of()
            : List.of(new RemoteReference(RemoteReference.Type.SHARED_ID, rootId));
    RemoteValue result = call(context, arguments);
    if ("null".equals(result.getType())) {
      return null;
    }
    Map<String, RemoteValue> fields = objectFields(result);
    if (fields.containsKey("error")) {
      // The only error the atom reports as data: the root left its document.
      throw new StaleElementReferenceException(STALE_MESSAGE);
    }
    List<RemoteWebElement> elements = new ArrayList<>();
    for (RemoteValue node : items(required(fields, "elements"))) {
      elements.add(element(sharedId(node)));
    }
    List<@Nullable String> windows = new ArrayList<>();
    for (RemoteValue window : items(required(fields, "windows"))) {
      windows.add(contextOf(window));
    }
    Map<String, Object> data = JSON.toType(string(required(fields, "json")), Json.MAP_TYPE);
    return fromWire(data, elements, index -> stitch(windows.get(index)));
  }

  /**
   * Runs the atom's wire entry in the sandbox of {@code context}; the remote value of its result.
   */
  private RemoteValue call(String context, List<LocalValue> arguments) {
    SerializationOptions options = new SerializationOptions();
    options.setMaxDomDepth(0);
    EvaluateResult result;
    try {
      result =
          script.callFunction(
              new CallFunctionParameters(
                      new ContextTarget(context, SANDBOX),
                      "(root) => (" + atom() + ")(root)",
                      false)
                  .arguments(arguments)
                  .resultOwnership(ResultOwnership.NONE)
                  .serializationOptions(options));
    } catch (WebDriverException e) {
      // The BiDi "no such node" error: the document of this context does not own the root's
      // shared id, either because the root lives in another frame or because its document is gone.
      if (mentions(e, "no such node")) {
        throw new NotOwned(e);
      }
      throw e;
    }
    if (result.getResultType() == EvaluateResult.Type.SUCCESS) {
      return ((EvaluateResultSuccess) result).getResult();
    }
    String text = ((EvaluateResultExceptionValue) result).getExceptionDetails().getText();
    throw new WebDriverException("accessibility snapshot failed in the page: " + text);
  }

  /** The document of a frame as the frame node's one child, or no children when unreachable. */
  private List<AccessibilityNode> stitch(@Nullable String context) {
    if (context == null) {
      return List.of();
    }
    AccessibilityNode document;
    try {
      document = snapshotContext(context, null);
    } catch (RuntimeException e) {
      // Gone between discovery and the call, or mid-navigation: the frame stays a leaf. Anything
      // else is a real failure.
      if (!frameUnreachable(e)) {
        throw e;
      }
      LOG.fine("accessibility snapshot: frame " + context + " not reachable: " + e.getMessage());
      return List.of();
    }
    return document == null ? List.of() : List.of(document);
  }

  /** The window's browsing contexts, top-level first, then each frame depth-first. */
  @SuppressWarnings("unchecked")
  private List<String> contexts(String top) {
    Map<String, Object> tree =
        bidi.send(new Command<>("browsingContext.getTree", Map.of("root", top), Map.class));
    List<String> contexts = new ArrayList<>();
    contexts.add(top);
    List<Object> stack = new ArrayList<>();
    Object roots = tree.get("contexts");
    if (roots instanceof List) {
      stack.addAll((List<Object>) roots);
    }
    while (!stack.isEmpty()) {
      Map<String, Object> info = (Map<String, Object>) stack.remove(0);
      String id = String.valueOf(info.get("context"));
      if (!top.equals(id)) {
        contexts.add(id);
      }
      Object children = info.get("children");
      if (children instanceof List) {
        stack.addAll(0, (List<Object>) children);
      }
    }
    return contexts;
  }

  private RemoteWebElement element(String sharedId) {
    Object converted =
        driver.getElementConverter().apply(Map.of(Dialect.W3C.getEncodedElementKey(), sharedId));
    return (RemoteWebElement) converted;
  }

  /** Whether an error says a frame or its document is gone, rather than that a command failed. */
  private static boolean frameUnreachable(RuntimeException e) {
    return e instanceof NotOwned || mentions(e, "no such frame") || mentions(e, "no such node");
  }

  private static boolean mentions(Throwable e, String text) {
    String message = e.getMessage();
    return message != null && message.contains(text);
  }

  private static Map<String, RemoteValue> objectFields(RemoteValue value) {
    if (!"object".equals(value.getType())) {
      throw new WebDriverException(
          "accessibility snapshot: expected an object remote value, got " + value.getType());
    }
    Object raw = value.getValue().orElse(Map.of());
    if (!(raw instanceof Map)) {
      throw new WebDriverException("accessibility snapshot: expected object entries");
    }
    Map<String, RemoteValue> fields = new LinkedHashMap<>();
    ((Map<?, ?>) raw)
        .forEach(
            (key, entry) -> {
              // A property name is written as a plain string, or as a string remote value.
              String name =
                  key instanceof RemoteValue ? string((RemoteValue) key) : String.valueOf(key);
              fields.put(name, (RemoteValue) entry);
            });
    return fields;
  }

  private static List<RemoteValue> items(RemoteValue array) {
    Object raw = array.getValue().orElse(List.of());
    if (!(raw instanceof List)) {
      throw new WebDriverException("accessibility snapshot: expected an array remote value");
    }
    List<RemoteValue> items = new ArrayList<>();
    for (Object item : (List<?>) raw) {
      items.add((RemoteValue) item);
    }
    return items;
  }

  private static RemoteValue required(Map<String, RemoteValue> fields, String name) {
    RemoteValue value = fields.get(name);
    if (value == null) {
      throw new WebDriverException("accessibility snapshot: the result has no " + name);
    }
    return value;
  }

  private static String string(RemoteValue value) {
    return value.getValue().map(String::valueOf).orElse("");
  }

  private static String sharedId(RemoteValue node) {
    if (!"node".equals(node.getType()) || node.getSharedId().isEmpty()) {
      throw new WebDriverException(
          "accessibility snapshot: expected a node reference in the elements list");
    }
    return node.getSharedId().get();
  }

  /**
   * The browsing context id of a window remote value; null for a frame with no reachable context.
   */
  private static @Nullable String contextOf(RemoteValue window) {
    if (!"window".equals(window.getType())) {
      return null;
    }
    Object properties = window.getValue().orElse(null);
    if (!(properties instanceof WindowProxyProperties)) {
      return null;
    }
    return ((WindowProxyProperties) properties).getBrowsingContext();
  }

  /** The atom's wire entry, a JavaScript function expression, read once from the jar. */
  private static String atom() {
    String source = atomSource;
    if (source == null) {
      source =
          Read.resourceAsString(
              AccessibilitySnapshotter.class,
              "/org/openqa/selenium/remote/accessibilitySnapshot.js");
      atomSource = source;
    }
    return source;
  }

  /** A shared id that the targeted document does not own. */
  private static final class NotOwned extends RuntimeException {
    NotOwned(Throwable cause) {
      super(cause.getMessage(), cause);
    }
  }
}
