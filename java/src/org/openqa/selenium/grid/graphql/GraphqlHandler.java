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

package org.openqa.selenium.grid.graphql;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.OPTIONS;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE_EVENT;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Weigher;
import graphql.ExecutionInput;
import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.execution.preparsed.PreparsedDocumentEntry;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

public class GraphqlHandler implements HttpHandler, AutoCloseable {

  public static final String GRID_SCHEMA =
      "/org/openqa/selenium/grid/graphql/selenium-grid-schema.graphqls";
  public static final Json JSON = new Json();
  private static final long MAX_QUERY_SIZE_BYTES = 1024 * 1024; // 1MB limit
  private final Tracer tracer;
  private final Distributor distributor;
  private final NewSessionQueue newSessionQueue;
  private final URI publicUri;
  private final String version;
  private final GraphQL graphQl;
  private final Cache<String, CompletableFuture<PreparsedDocumentEntry>> cache;

  public GraphqlHandler(
      Tracer tracer,
      Distributor distributor,
      NewSessionQueue newSessionQueue,
      URI publicUri,
      String version) {
    this.distributor = Require.nonNull("Distributor", distributor);
    this.newSessionQueue = Require.nonNull("New session queue", newSessionQueue);
    this.publicUri = Require.nonNull("Uri", publicUri);
    this.version = Require.nonNull("GridVersion", version);
    this.tracer = Require.nonNull("Tracer", tracer);

    // Container-aware cache sizing: 5% of heap memory
    long maxMemory = Runtime.getRuntime().maxMemory();
    long cacheWeightLimit = (long) (maxMemory * 0.05);

    // Custom weigher to prevent single entries from exceeding 10% of cache weight
    Weigher<String, CompletableFuture<PreparsedDocumentEntry>> weigher =
        new QueryCacheWeigher(cacheWeightLimit);

    this.cache =
        Caffeine.newBuilder()
            .maximumWeight(cacheWeightLimit)
            .weigher(weigher)
            .expireAfterAccess(Duration.ofMinutes(30)) // Time-based eviction
            .build();

    GraphQLSchema schema =
        new SchemaGenerator()
            .makeExecutableSchema(buildTypeDefinitionRegistry(), buildRuntimeWiring());

    graphQl =
        GraphQL.newGraphQL(schema)
            .preparsedDocumentProvider(
                (executionInput, computeFunction) -> {
                  String query = executionInput.getQuery();

                  // Query size validation with bypass for oversized queries
                  if (query.getBytes(StandardCharsets.UTF_8).length > MAX_QUERY_SIZE_BYTES) {
                    // Bypass cache for oversized queries to prevent cache pollution
                    return CompletableFuture.supplyAsync(
                        () -> computeFunction.apply(executionInput));
                  }

                  return cache.get(
                      query,
                      key ->
                          CompletableFuture.supplyAsync(
                              () -> computeFunction.apply(executionInput)));
                })
            .build();
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    if (req.getMethod() == OPTIONS) {
      return new HttpResponse();
    }
    try (Span span = newSpanAsChildOf(tracer, req, "grid.status")) {
      HttpResponse response;
      Map<String, Object> inputs = JSON.toType(Contents.string(req), MAP_TYPE);

      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), getClass().getName());

      HTTP_REQUEST.accept(span, req);
      HTTP_REQUEST_EVENT.accept(attributeMap, req);

      if (!(inputs.get("query") instanceof String)) {
        response =
            new HttpResponse()
                .setStatus(HTTP_INTERNAL_ERROR)
                .setContent(Contents.utf8String("Unable to find query"));

        HTTP_RESPONSE.accept(span, response);
        HTTP_RESPONSE_EVENT.accept(attributeMap, response);

        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(), "Unable to find query");

        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.NOT_FOUND);
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        return response;
      }

      String query = (String) inputs.get("query");

      @SuppressWarnings("unchecked")
      Map<String, Object> variables =
          inputs.get("variables") instanceof Map
              ? (Map<String, Object>) inputs.get("variables")
              : new HashMap<>();

      ExecutionInput executionInput =
          ExecutionInput.newExecutionInput(query).variables(variables).build();

      ExecutionResult result = graphQl.execute(executionInput);

      if (result.isDataPresent()) {
        response =
            new HttpResponse()
                .addHeader("Content-Type", JSON_UTF_8)
                .setContent(utf8String(JSON.toJson(result.toSpecification())));

        HTTP_RESPONSE.accept(span, response);
        HTTP_RESPONSE_EVENT.accept(attributeMap, response);
        span.addEvent("Graphql query executed", attributeMap);

        return response;
      }

      response =
          new HttpResponse()
              .setStatus(HTTP_INTERNAL_ERROR)
              .setContent(utf8String(JSON.toJson(result.getErrors())));
      HTTP_RESPONSE.accept(span, response);
      HTTP_RESPONSE_EVENT.accept(attributeMap, response);

      attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(), "Error while executing the query");
      span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

      span.setAttribute(AttributeKey.ERROR.getKey(), true);
      span.setStatus(Status.INTERNAL);

      return response;
    }
  }

  @Override
  public void close() {
    // Cancel pending CompletableFutures
    cache
        .asMap()
        .values()
        .forEach(
            future -> {
              if (!future.isDone()) {
                future.cancel(true);
              }
            });

    // Invalidate and clean cache
    cache.invalidateAll();
    cache.cleanUp();
  }

  private RuntimeWiring buildRuntimeWiring() {
    GridData gridData = new GridData(distributor, newSessionQueue, publicUri, version);
    return RuntimeWiring.newRuntimeWiring()
        .scalar(Types.Uri)
        .scalar(Types.Url)
        .type(
            "GridQuery",
            typeWiring ->
                typeWiring
                    .dataFetcher("grid", gridData)
                    .dataFetcher("sessionsInfo", gridData)
                    .dataFetcher("nodesInfo", gridData)
                    .dataFetcher("session", new SessionData(distributor)))
        .build();
  }

  private TypeDefinitionRegistry buildTypeDefinitionRegistry() {
    try (InputStream stream = getClass().getResourceAsStream(GRID_SCHEMA)) {
      return new SchemaParser().parse(stream);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  // Custom weigher class for query cache
  private static class QueryCacheWeigher
      implements Weigher<String, CompletableFuture<PreparsedDocumentEntry>> {

    private final long maxSingleEntryWeight;

    public QueryCacheWeigher(long cacheWeightLimit) {
      this.maxSingleEntryWeight = (long) (cacheWeightLimit * 0.1); // 10% limit
    }

    @Override
    public int weigh(String key, CompletableFuture<PreparsedDocumentEntry> value) {
      // Estimate memory usage including CompletableFuture overhead
      long keyWeight = key.length() * 2; // UTF-16 encoding
      long futureOverhead = 200; // Estimated CompletableFuture overhead
      long documentOverhead = 500; // Estimated PreparsedDocumentEntry overhead

      long totalWeight = keyWeight + futureOverhead + documentOverhead;

      // Bounds checking to prevent single entries from dominating cache and integer overflow
      long boundedWeight = Math.min(totalWeight, maxSingleEntryWeight);
      return (int) Math.min(boundedWeight, Integer.MAX_VALUE);
    }
  }
}
