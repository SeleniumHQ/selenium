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

package org.openqa.selenium.remote.http;

import static com.google.common.collect.ImmutableList.toImmutableList;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.OPTIONS;
import static org.openqa.selenium.remote.http.HttpMethod.POST;
import static org.openqa.selenium.remote.http.UrlPath.ROUTE_PREFIX_KEY;

import com.google.common.collect.ImmutableMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.openqa.selenium.internal.Require;

public abstract class Route implements HttpHandler, Routable {

  public HttpHandler fallbackTo(Supplier<HttpHandler> handler) {
    Require.nonNull("Handler", handler);
    return req -> {
      if (matches(req)) {
        return Route.this.execute(req);
      }
      return Require.state("Handler", handler.get()).nonNull().execute(req);
    };
  }

  @Override
  public final HttpResponse execute(HttpRequest req) {
    if (!matches(req)) {
      return new HttpResponse()
          .setStatus(HTTP_NOT_FOUND)
          .setContent(
              asJson(
                  ImmutableMap.of(
                      "value",
                      ImmutableMap.of(
                          "error", "unknown command",
                          "message", "Unable to find handler for " + req,
                          "stacktrace", ""))));
    }

    HttpResponse res = handle(req);

    if (res != null) {
      return res;
    }

    return new HttpResponse()
        .setStatus(HTTP_INTERNAL_ERROR)
        .addHeader("WebDriver-Error", "unsupported operation")
        .addHeader("Selenium-Route", "NULL_RES")
        .setContent(
            asJson(
                ImmutableMap.of(
                    "value",
                    ImmutableMap.of(
                        "error", "unsupported operation",
                        "message",
                            String.format("Found handler for %s, but nothing was returned", req),
                        "stacktrace", ""))));
  }

  protected abstract HttpResponse handle(HttpRequest req);

  public static PredicatedConfig matching(Predicate<HttpRequest> predicate) {
    return new PredicatedConfig(Require.nonNull("Predicate", predicate));
  }

  public static TemplatizedRouteConfig delete(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(Require.nonNull("URL template", template));

    return new TemplatizedRouteConfig(
        new MatchesHttpMethod(DELETE).and(new MatchesTemplate(urlTemplate)), urlTemplate);
  }

  public static TemplatizedRouteConfig get(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(Require.nonNull("URL template", template));

    return new TemplatizedRouteConfig(
        new MatchesHttpMethod(GET).and(new MatchesTemplate(urlTemplate)), urlTemplate);
  }

  public static TemplatizedRouteConfig post(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(Require.nonNull("URL template", template));

    return new TemplatizedRouteConfig(
        new MatchesHttpMethod(POST).and(new MatchesTemplate(urlTemplate)), urlTemplate);
  }

  public static TemplatizedRouteConfig options(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(Require.nonNull("URL template", template));

    return new TemplatizedRouteConfig(
        new MatchesHttpMethod(OPTIONS).and(new MatchesTemplate(urlTemplate)), urlTemplate);
  }

  public static NestedRouteConfig prefix(String prefix) {
    Require.nonNull("Prefix", prefix);
    Require.stateCondition(!prefix.isEmpty(), "Prefix to use must not be of 0 length");
    return new NestedRouteConfig(prefix);
  }

  public static Route combine(Routable first, Routable... others) {
    Require.nonNull("At least one route", first);
    return new CombinedRoute(Stream.concat(Stream.of(first), Stream.of(others)));
  }

  public static Route combine(Iterable<Routable> routes) {
    Require.nonNull("At least one route", routes);
    return new CombinedRoute(StreamSupport.stream(routes.spliterator(), false));
  }

  public static class TemplatizedRouteConfig {

    private final Predicate<HttpRequest> predicate;
    private final UrlTemplate template;

    private TemplatizedRouteConfig(Predicate<HttpRequest> predicate, UrlTemplate template) {
      this.predicate = Require.nonNull("Predicate", predicate);
      this.template = Require.nonNull("URL template", template);
    }

    public Route to(Supplier<HttpHandler> handler) {
      Require.nonNull("Handler supplier", handler);
      return to(params -> handler.get());
    }

    public Route to(Function<Map<String, String>, HttpHandler> handlerFunc) {
      Require.nonNull("Handler creator", handlerFunc);
      return new TemplatizedRoute(template, predicate, handlerFunc);
    }
  }

  private static class TemplatizedRoute extends Route {

    private final UrlTemplate template;
    private final Predicate<HttpRequest> predicate;
    private final Function<Map<String, String>, HttpHandler> handlerFunction;

    private TemplatizedRoute(
        UrlTemplate template,
        Predicate<HttpRequest> predicate,
        Function<Map<String, String>, HttpHandler> handlerFunction) {
      this.template = Require.nonNull("URL template", template);
      this.predicate = Require.nonNull("Predicate", predicate);
      this.handlerFunction = Require.nonNull("Handler function", handlerFunction);
    }

    @Override
    public boolean matches(HttpRequest request) {
      return predicate.test(request);
    }

    @Override
    protected HttpResponse handle(HttpRequest req) {
      UrlTemplate.Match match = template.match(req.getUri());
      HttpHandler handler =
          handlerFunction.apply(match == null ? ImmutableMap.of() : match.getParameters());

      if (handler == null) {
        return new HttpResponse()
            .setStatus(HTTP_INTERNAL_ERROR)
            .setContent(utf8String("Unable to find handler for " + req));
      }

      return handler.execute(req);
    }
  }

  private static class MatchesHttpMethod implements Predicate<HttpRequest> {

    private final HttpMethod method;

    private MatchesHttpMethod(HttpMethod method) {
      this.method = Require.nonNull("HTTP method to test", method);
    }

    @Override
    public boolean test(HttpRequest request) {
      return method == request.getMethod();
    }
  }

  private static class MatchesTemplate implements Predicate<HttpRequest> {

    private final UrlTemplate template;

    private MatchesTemplate(UrlTemplate template) {
      this.template = Require.nonNull("URL template to test", template);
    }

    @Override
    public boolean test(HttpRequest request) {
      return template.match(request.getUri()) != null;
    }
  }

  public static class NestedRouteConfig {

    private final String prefix;

    private NestedRouteConfig(String prefix) {
      this.prefix = Require.nonNull("Prefix", prefix);
    }

    public Route to(Route route) {
      Require.nonNull("Target for requests", route);
      return new NestedRoute(prefix, route);
    }
  }

  private static class NestedRoute extends Route {

    private final String[] prefixPaths;
    private final String prefix;
    private final Route route;

    private NestedRoute(String prefix, Route route) {
      this.prefixPaths = Require.nonNull("Prefix", prefix).split("/");
      this.prefix = prefix;
      this.route = Require.nonNull("Target for requests", route);
    }

    @Override
    public boolean matches(HttpRequest request) {
      return hasPrefix(request) && route.matches(transform(request));
    }

    private boolean hasPrefix(HttpRequest request) {
      String[] parts = request.getUri().split("/");
      if (parts.length < prefixPaths.length) {
        return false;
      }
      for (int i = 0; i < prefixPaths.length; i++) {
        if (!prefixPaths[i].equals(parts[i])) {
          return false;
        }
      }
      return true;
    }

    @Override
    protected HttpResponse handle(HttpRequest req) {
      return route.execute(transform(req));
    }

    private HttpRequest transform(HttpRequest request) {
      // Strip the prefix from the existing request and forward it.
      String unprefixed =
          hasPrefix(request) ? request.getUri().substring(prefix.length()) : request.getUri();

      HttpRequest toForward = new HttpRequest(request.getMethod(), unprefixed);

      request
          .getHeaderNames()
          .forEach(
              name -> {
                if (name == null) {
                  return;
                }
                request.getHeaders(name).forEach(value -> toForward.addHeader(name, value));
              });

      request
          .getAttributeNames()
          .forEach(attr -> toForward.setAttribute(attr, request.getAttribute(attr)));

      // Don't forget to register our prefix
      Object rawPrefixes = request.getAttribute(ROUTE_PREFIX_KEY);
      if (!(rawPrefixes instanceof List)) {
        rawPrefixes = new LinkedList<>();
      }
      List<String> prefixes =
          Stream.concat(((List<?>) rawPrefixes).stream(), Stream.of(prefix))
              .map(String::valueOf)
              .collect(toImmutableList());
      toForward.setAttribute(ROUTE_PREFIX_KEY, prefixes);

      request
          .getQueryParameterNames()
          .forEach(
              name ->
                  request
                      .getQueryParameters(name)
                      .forEach(value -> toForward.addQueryParameter(name, value)));

      toForward.setContent(request.getContent());

      return toForward;
    }
  }

  private static class CombinedRoute extends Route {

    private final List<Routable> allRoutes;

    private CombinedRoute(Stream<Routable> routes) {
      // We want later routes to have a greater chance of being called so that we can override
      // routes as necessary.
      allRoutes = routes.collect(toImmutableList()).reverse();
      Require.stateCondition(!allRoutes.isEmpty(), "At least one route must be specified.");
    }

    @Override
    public boolean matches(HttpRequest request) {
      return allRoutes.stream().anyMatch(route -> route.matches(request));
    }

    @Override
    protected HttpResponse handle(HttpRequest req) {
      return allRoutes.stream()
          .filter(route -> route.matches(req))
          .findFirst()
          .map(route -> (HttpHandler) route)
          .orElse(
              request ->
                  new HttpResponse()
                      .setStatus(HTTP_NOT_FOUND)
                      .setContent(utf8String("No handler found for " + request)))
          .execute(req);
    }
  }

  public static class PredicatedConfig {
    private final Predicate<HttpRequest> predicate;

    private PredicatedConfig(Predicate<HttpRequest> predicate) {
      this.predicate = Require.nonNull("Predicate", predicate);
    }

    public Route to(Supplier<HttpHandler> handler) {
      return new PredicatedRoute(predicate, Require.nonNull("Handler supplier", handler));
    }
  }

  private static class PredicatedRoute extends Route {

    private final Predicate<HttpRequest> predicate;
    private final Supplier<HttpHandler> supplier;

    private PredicatedRoute(Predicate<HttpRequest> predicate, Supplier<HttpHandler> supplier) {
      this.predicate = Require.nonNull("Predicate", predicate);
      this.supplier = Require.nonNull("Supplier", supplier);
    }

    @Override
    public boolean matches(HttpRequest httpRequest) {
      return predicate.test(httpRequest);
    }

    @Override
    protected HttpResponse handle(HttpRequest req) {
      HttpHandler handler = supplier.get();
      if (handler == null) {
        throw new IllegalStateException("No handler available.");
      }
      return handler.execute(req);
    }
  }
}
