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
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.AccessibilityNode;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
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

/**
 * Takes accessibility snapshots for one BiDi session: installs the atom in the sandbox realm of
 * each document and stitches child frames into the tree.
 */
class AccessibilitySnapshotter {

  private static final Logger LOG = Logger.getLogger(AccessibilitySnapshotter.class.getName());

  /** The sandbox realm the atom runs in: page scripts cannot reach its prototypes. */
  private static final String SANDBOX = "selenium";

  /** Where the atom is kept inside the sandbox realm once installed. */
  private static final String GLOBAL = "__seleniumAccessibilitySnapshot";

  private static final String STALE_MESSAGE =
      "the snapshot root is no longer attached to a document";

  private static volatile @Nullable String atomSource;

  private final RemoteWebDriver driver;
  private final BiDi bidi;
  private final Script script;
  private boolean preloaded;

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
    ensurePreload();
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
    // group, so the script checks ownership itself and each context is tried until the owner is
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

  // New documents get the atom installed as they load; documents that predate the preload install
  // it on first use, in call(). The flag follows a successful registration, so a failed one is
  // tried again on the next snapshot.
  private void ensurePreload() {
    if (preloaded) {
      return;
    }
    try {
      script.addPreloadScript("() => { globalThis." + GLOBAL + " = (" + atom() + "); }", SANDBOX);
    } catch (WebDriverException e) {
      LOG.fine(
          "accessibility snapshot: preload not installed, falling back to on-demand install: "
              + e.getMessage());
      return;
    }
    preloaded = true;
  }

  /** The snapshot of {@code context}, or {@code null} when another document owns the root. */
  private @Nullable AccessibilityNode snapshotContext(String context, @Nullable String rootId) {
    List<LocalValue> arguments =
        rootId == null
            ? List.of()
            : List.of(new RemoteReference(RemoteReference.Type.SHARED_ID, rootId));
    RemoteValue result =
        call(context, declaration("globalThis." + GLOBAL, rootId), arguments, false);
    if (result == null) {
      // The realm has no atom yet (a document loaded before the preload, or a remote end without
      // preload support): install it and run in one call.
      result =
          call(
              context,
              declaration("(globalThis." + GLOBAL + " = (" + atom() + "))", rootId),
              arguments,
              true);
    }
    if (result == null || "null".equals(result.getType())) {
      // Another document owns the root (Firefox resolves shared ids group-wide).
      return null;
    }
    return decode(result, context);
  }

  /** The function to call: the whole page, or a root this document owns, else null. */
  private static String declaration(String atom, @Nullable String rootId) {
    if (rootId == null) {
      return "() => " + atom + "()";
    }
    return "(root) => root && root.ownerDocument === document ? " + atom + "(root) : null";
  }

  /**
   * Runs {@code declaration} in the sandbox of {@code context}; {@code null} when it threw and a
   * retry may help.
   */
  private @Nullable RemoteValue call(
      String context, String declaration, List<LocalValue> arguments, boolean installAndRun) {
    SerializationOptions options = new SerializationOptions();
    options.setMaxDomDepth(0);
    EvaluateResult result =
        callFunction(
            new CallFunctionParameters(new ContextTarget(context, SANDBOX), declaration, false)
                .arguments(arguments)
                .resultOwnership(ResultOwnership.NONE)
                .serializationOptions(options));
    if (result.getResultType() == EvaluateResult.Type.SUCCESS) {
      return ((EvaluateResultSuccess) result).getResult();
    }
    String text = ((EvaluateResultExceptionValue) result).getExceptionDetails().getText();
    if (text != null && text.contains("detached")) {
      throw new StaleElementReferenceException(STALE_MESSAGE);
    }
    if (!installAndRun) {
      return null;
    }
    throw new WebDriverException("accessibility snapshot failed in the page: " + text);
  }

  private EvaluateResult callFunction(CallFunctionParameters parameters) {
    try {
      return script.callFunction(parameters);
    } catch (WebDriverException e) {
      // The BiDi "no such node" error: the document of this context does not own the root's
      // shared id, either because the root lives in another frame or because its document is gone.
      if (mentions(e, "no such node")) {
        throw new NotOwned(e);
      }
      throw e;
    }
  }

  /**
   * Decodes a snapshot from the {@code script.callFunction} result that carries it: an {@code
   * object} remote value whose entries are the node's fields, with arrays as {@code array} and
   * elements as {@code node} values carrying a {@code sharedId}. An {@code iframe} node's children
   * are replaced by its document's tree where reachable.
   */
  private AccessibilityNode decode(RemoteValue value, String context) {
    Map<String, RemoteValue> fields = objectFields(value);
    RemoteValue elementValue = fields.get("element");
    String sharedId = null;
    if (elementValue != null && "node".equals(elementValue.getType())) {
      sharedId = elementValue.getSharedId().orElse(null);
    }
    RemoteValue valueField = fields.get("value");
    RemoteValue descriptionField = fields.get("description");
    String role = string(required(fields, "role"));

    Map<String, Object> states = new LinkedHashMap<>();
    objectFields(required(fields, "states")).forEach((key, state) -> states.put(key, state(state)));

    List<AccessibilityNode> children = new ArrayList<>();
    if ("iframe".equals(role) && sharedId != null) {
      children.addAll(stitch(context, sharedId));
    } else {
      RemoteValue childrenField = required(fields, "children");
      Object items = childrenField.getValue().orElse(List.of());
      if (!(items instanceof List)) {
        throw new WebDriverException(
            "accessibility snapshot: expected an array of children, got "
                + childrenField.getType());
      }
      for (Object item : (List<?>) items) {
        children.add(decode((RemoteValue) item, context));
      }
    }

    return new AccessibilityNode(
        role,
        string(required(fields, "name")),
        descriptionField == null ? "" : string(descriptionField),
        valueField == null ? null : string(valueField),
        states,
        sharedId == null ? null : element(sharedId),
        children);
  }

  /** The document of a frame as the frame node's one child, or no children when unreachable. */
  private List<AccessibilityNode> stitch(String context, String frameId) {
    String childContext = frameContext(context, frameId);
    if (childContext == null) {
      return List.of();
    }
    try {
      AccessibilityNode document = snapshotContext(childContext, null);
      return document == null ? List.of() : List.of(document);
    } catch (NotOwned | WebDriverException e) {
      // Gone between discovery and the call, or mid-navigation: the frame stays a leaf. Anything
      // else is a real failure.
      if (!frameUnreachable(e)) {
        throw e;
      }
      LOG.fine(
          "accessibility snapshot: frame " + childContext + " not reachable: " + e.getMessage());
      return List.of();
    }
  }

  /**
   * The browsing context id of a frame element, from its WindowProxy; {@code null} when it has
   * none.
   */
  private @Nullable String frameContext(String context, String frameId) {
    EvaluateResult result;
    try {
      result =
          callFunction(
              new CallFunctionParameters(
                      new ContextTarget(context, SANDBOX), "(frame) => frame.contentWindow", false)
                  .arguments(List.of(new RemoteReference(RemoteReference.Type.SHARED_ID, frameId)))
                  .resultOwnership(ResultOwnership.NONE));
    } catch (NotOwned | WebDriverException e) {
      if (!frameUnreachable(e)) {
        throw e;
      }
      LOG.fine("accessibility snapshot: no browsing context for frame: " + e.getMessage());
      return null;
    }
    if (result.getResultType() != EvaluateResult.Type.SUCCESS) {
      return null;
    }
    RemoteValue window = ((EvaluateResultSuccess) result).getResult();
    if (!"window".equals(window.getType())) {
      return null;
    }
    Object properties = window.getValue().orElse(null);
    if (!(properties instanceof WindowProxyProperties)) {
      return null;
    }
    return ((WindowProxyProperties) properties).getBrowsingContext();
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

  private static RemoteValue required(Map<String, RemoteValue> fields, String name) {
    RemoteValue value = fields.get(name);
    if (value == null) {
      throw new WebDriverException("accessibility snapshot: the node has no " + name);
    }
    return value;
  }

  private static String string(RemoteValue value) {
    return value.getValue().map(String::valueOf).orElse("");
  }

  private static Object state(RemoteValue value) {
    Object raw = value.getValue().orElse(null);
    switch (value.getType()) {
      case "boolean":
        return Boolean.TRUE.equals(raw);
      case "number":
        return raw instanceof Number ? ((Number) raw).longValue() : 0L;
      default:
        return String.valueOf(raw);
    }
  }

  /** The atom's source, a JavaScript function expression, read once from the jar. */
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
