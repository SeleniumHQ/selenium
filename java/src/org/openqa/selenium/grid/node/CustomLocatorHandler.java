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

package org.openqa.selenium.grid.node;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.grid.security.AddSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.AddWebDriverSpecHeaders;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpResponseCodec;
import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.UrlTemplate;
import org.openqa.selenium.remote.locators.CustomLocator;

class CustomLocatorHandler implements Routable {

  private static final Logger LOG = Logger.getLogger(CustomLocatorHandler.class.getName());
  private static final Json JSON = new Json();
  private static final UrlTemplate FIND_ELEMENT = new UrlTemplate("/session/{sessionId}/element");
  private static final UrlTemplate FIND_ELEMENTS = new UrlTemplate("/session/{sessionId}/elements");
  private static final UrlTemplate FIND_CHILD_ELEMENT =
      new UrlTemplate("/session/{sessionId}/element/{elementId}/element");
  private static final UrlTemplate FIND_CHILD_ELEMENTS =
      new UrlTemplate("/session/{sessionId}/element/{elementId}/elements");
  // These are derived from the w3c webdriver spec
  private static final Set<String> W3C_STRATEGIES =
      ImmutableSet.of("css selector", "link text", "partial link text", "tag name", "xpath");
  private final HttpHandler toNode;
  private final Map<String, Function<Object, By>> extraLocators;

  @VisibleForTesting
  CustomLocatorHandler(Node node, Secret registrationSecret, Set<CustomLocator> extraLocators) {
    Require.nonNull("Node", node);
    Require.nonNull("Registration secret", registrationSecret);
    Require.nonNull("Extra locators", extraLocators);

    HttpHandler nodeHandler = node::executeWebDriverCommand;
    this.toNode =
        nodeHandler
            .with(new AddSeleniumUserAgent())
            .with(new AddWebDriverSpecHeaders())
            .with(new AddSecretFilter(registrationSecret));

    this.extraLocators =
        extraLocators.stream()
            .collect(Collectors.toMap(CustomLocator::getLocatorName, locator -> locator::createBy));
  }

  @Override
  public boolean matches(HttpRequest req) {
    if (req.getMethod() != HttpMethod.POST) {
      return false;
    }

    return FIND_ELEMENT.match(req.getUri()) != null
        || FIND_ELEMENTS.match(req.getUri()) != null
        || FIND_CHILD_ELEMENT.match(req.getUri()) != null
        || FIND_CHILD_ELEMENTS.match(req.getUri()) != null;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String originalContents = Contents.string(req);

    // There has to be a nicer way of doing this.
    Map<String, Object> contents = JSON.toType(originalContents, MAP_TYPE);

    Object using = contents.get("using");
    if (!(using instanceof String)) {
      return new HttpResponse()
          .setStatus(HTTP_BAD_REQUEST)
          .setContent(
              Contents.asJson(
                  ImmutableMap.of(
                      "value",
                      ImmutableMap.of(
                          "error", "invalid argument",
                          "message", "Unable to determine element locating strategy",
                          "stacktrace", ""))));
    }

    if (W3C_STRATEGIES.contains(using)) {
      // TODO: recreate the original request
      return toNode.execute(req);
    }

    Object value = contents.get("value");
    if (value == null) {
      return new HttpResponse()
          .setStatus(HTTP_BAD_REQUEST)
          .setContent(
              Contents.asJson(
                  ImmutableMap.of(
                      "value",
                      ImmutableMap.of(
                          "error", "invalid argument",
                          "message", "Unable to determine element locator arguments",
                          "stacktrace", ""))));
    }

    Function<Object, By> customLocator = extraLocators.get(using);
    if (customLocator == null) {
      LOG.warning(
          () ->
              String.format(
                  "No custom locator found for '%s', the remote end will determine if the locator"
                      + " is valid.",
                  using));
      return toNode.execute(req);
    }

    String usingLocator = String.valueOf(using);
    if ("id".equalsIgnoreCase(usingLocator) || "name".equalsIgnoreCase(usingLocator)) {
      LOG.warning(
          () ->
              String.format(
                  "Custom conversion to a CSS locator from '%s' will be removed soon. Please switch"
                      + " to a valid W3C WebDriver locator strategy"
                      + " https://www.w3.org/TR/webdriver1/#locator-strategies",
                  using));
    }

    CommandExecutor executor = new NodeWrappingExecutor(toNode);
    RemoteWebDriver driver =
        new CustomWebDriver(
            executor,
            HttpSessionId.getSessionId(req.getUri())
                .orElseThrow(
                    () ->
                        new IllegalArgumentException(
                            "Cannot locate session ID from " + req.getUri())));

    SearchContext context = null;
    RemoteWebElement element;
    boolean findMultiple = false;
    UrlTemplate.Match match = FIND_ELEMENT.match(req.getUri());
    if (match != null) {
      element = new RemoteWebElement();
      element.setParent(driver);
      element.setId(match.getParameters().get("elementId"));
      context = driver;
    }
    match = FIND_ELEMENTS.match(req.getUri());
    if (match != null) {
      element = new RemoteWebElement();
      element.setParent(driver);
      element.setId(match.getParameters().get("elementId"));
      context = driver;
      findMultiple = true;
    }
    match = FIND_CHILD_ELEMENT.match(req.getUri());
    if (match != null) {
      element = new RemoteWebElement();
      element.setParent(driver);
      element.setId(match.getParameters().get("elementId"));
      context = element;
    }
    match = FIND_CHILD_ELEMENTS.match(req.getUri());
    if (match != null) {
      element = new RemoteWebElement();
      element.setParent(driver);
      element.setId(match.getParameters().get("elementId"));
      context = element;
      findMultiple = true;
    }

    if (context == null) {
      throw new IllegalStateException("Unable to determine locator context: " + req);
    }

    Object toReturn;
    By by = customLocator.apply(value);
    if (findMultiple) {
      toReturn = context.findElements(by);
    } else {
      toReturn = context.findElement(by);
    }

    return new HttpResponse().setContent(Contents.asJson(ImmutableMap.of("value", toReturn)));
  }

  private static class NodeWrappingExecutor implements CommandExecutor {
    private final HttpHandler toNode;
    private final CommandCodec<HttpRequest> commandCodec;
    private final ResponseCodec<HttpResponse> responseCodec;

    public NodeWrappingExecutor(HttpHandler toNode) {
      this.toNode = Require.nonNull("Node", toNode);
      commandCodec = new W3CHttpCommandCodec();
      responseCodec = new W3CHttpResponseCodec();
    }

    @Override
    public Response execute(Command command) throws IOException {
      if (DriverCommand.NEW_SESSION.equals(command.getName())) {
        Response response = new Response();
        response.setState("session not created");
        return response;
      }

      if (command.getSessionId() == null) {
        Response response = new Response();
        response.setState("invalid session id");
        return response;
      }

      HttpRequest request = commandCodec.encode(command);
      HttpResponse response = toNode.execute(request);
      Response decoded = responseCodec.decode(response);
      decoded.setSessionId(command.getSessionId().toString());
      return decoded;
    }
  }

  private static class CustomWebDriver extends RemoteWebDriver {
    public CustomWebDriver(CommandExecutor executor, String sessionId) {
      super(executor, new ImmutableCapabilities());

      setSessionId(sessionId);
    }

    @Override
    protected void startSession(Capabilities capabilities) {
      // no-op
    }

    @Override
    public void quit() {
      // no-op. We don't want people killing the session
    }
  }
}
