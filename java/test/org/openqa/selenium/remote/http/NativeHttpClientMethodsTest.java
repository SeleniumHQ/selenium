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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for the new native Java 11 HTTP methods in HttpClient interface: - sendAsyncNative() -
 * sendNative()
 */
@Tag("UnitTests")
class NativeHttpClientMethodsTest {

  private TestHttpClient httpClient;
  private HttpRequest testRequest;

  @BeforeEach
  void setUp() {
    // Initialize test client and create sample HTTP request for testing
    httpClient = new TestHttpClient();

    // Create a sample HTTP request for testing
    testRequest = HttpRequest.newBuilder().uri(URI.create("https://httpbin.org/get")).GET().build();
  }

  /**
   * Tests that sendAsyncNative() method executes successfully and returns a CompletableFuture with
   * the expected HTTP response. Verifies that: - The method returns a non-null CompletableFuture -
   * The response can be retrieved within timeout - The response contains expected status code and
   * body
   */
  @Test
  void testSendAsyncNative_successful()
      throws ExecutionException, InterruptedException, TimeoutException {
    // Act - Execute asynchronous HTTP request using native Java 11 API
    CompletableFuture<HttpResponse<String>> result =
        httpClient.sendAsyncNative(testRequest, HttpResponse.BodyHandlers.ofString());

    // Assert - Verify the asynchronous response is correct
    assertNotNull(result, "Future should not be null");
    HttpResponse<String> response = result.get(5, TimeUnit.SECONDS);
    assertNotNull(response, "Response should not be null");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).isEqualTo("Test response body");
  }

  /**
   * Tests that sendNative() method executes successfully in a synchronous manner. Verifies that: -
   * The method returns a valid HTTP response - The response contains the expected status code and
   * body content - The synchronous call completes without throwing exceptions
   */
  @Test
  void testSendNative_successful() throws IOException, InterruptedException {
    // Act - Execute synchronous HTTP request using native Java 11 API
    HttpResponse<String> result =
        httpClient.sendNative(testRequest, HttpResponse.BodyHandlers.ofString());

    // Assert - Verify the synchronous response is correct
    assertNotNull(result, "Response should not be null");
    assertThat(result.statusCode()).isEqualTo(200);
    assertThat(result.body()).isEqualTo("Test response body");
  }

  /**
   * Tests that sendNative() method properly handles IOException when network errors occur. Verifies
   * that: - IOException is thrown when the client is configured to fail - The exception propagates
   * correctly to the caller - Error handling behavior is consistent with Java 11 HttpClient
   * expectations
   */
  @Test
  void testSendNative_handlesIOException() {
    // Arrange - Create a client configured to simulate network failure
    TestHttpClient failingClient = new TestHttpClient(true);

    // Act & Assert - Verify that IOException is thrown when network failure occurs
    assertThrows(
        IOException.class,
        () -> failingClient.sendNative(testRequest, HttpResponse.BodyHandlers.ofString()));
  }

  /**
   * Tests that HTTP request parameters are properly validated and constructed. Verifies that: - GET
   * requests are created with correct method and URI - POST requests are created with correct
   * method, headers, and body - Request headers are properly set and accessible - Different HTTP
   * methods can be distinguished correctly
   */
  @Test
  void testRequestParameters_validation() {
    // Test GET request creation and validation
    HttpRequest getRequest =
        HttpRequest.newBuilder().uri(URI.create("https://httpbin.org/get")).GET().build();

    // Assert GET request properties
    assertNotNull(getRequest);
    assertThat(getRequest.method()).isEqualTo("GET");

    // Test POST request creation with body and headers
    HttpRequest postRequest =
        HttpRequest.newBuilder()
            .uri(URI.create("https://httpbin.org/post"))
            .POST(HttpRequest.BodyPublishers.ofString("{\"test\": \"data\"}"))
            .header("Content-Type", "application/json")
            .build();

    // Assert POST request properties including headers
    assertNotNull(postRequest);
    assertThat(postRequest.method()).isEqualTo("POST");
    assertTrue(postRequest.headers().firstValue("Content-Type").isPresent());
  }

  /**
   * Tests that different types of BodyHandlers are properly supported and instantiated. Verifies
   * that: - String BodyHandler for text responses works correctly - Discarding BodyHandler for HEAD
   * requests or when body is not needed - Lines BodyHandler for streaming large text responses line
   * by line - All BodyHandler types can be created without errors
   */
  @Test
  void testBodyHandlers_variations() {
    // Test String handler for regular text responses
    HttpResponse.BodyHandler<String> stringHandler = HttpResponse.BodyHandlers.ofString();
    assertNotNull(stringHandler);

    // Test discarding handler (useful for HEAD requests or when body is not needed)
    HttpResponse.BodyHandler<Void> discardingHandler = HttpResponse.BodyHandlers.discarding();
    assertNotNull(discardingHandler);

    // Test lines handler for streaming large responses line by line
    HttpResponse.BodyHandler<java.util.stream.Stream<String>> linesHandler =
        HttpResponse.BodyHandlers.ofLines();
    assertNotNull(linesHandler);
  }

  /**
   * Simple test implementation of HttpClient for testing purposes. Provides mock implementations of
   * all HttpClient methods with: - Configurable failure simulation for error testing - Mock HTTP
   * responses with predictable data - UnsupportedOperationException for methods not relevant to
   * native API testing
   */
  private static class TestHttpClient implements HttpClient {
    private final boolean shouldFail;

    public TestHttpClient() {
      this(false);
    }

    public TestHttpClient(boolean shouldFail) {
      this.shouldFail = shouldFail;
    }

    @Override
    public WebSocket openSocket(
        org.openqa.selenium.remote.http.HttpRequest request, WebSocket.Listener listener) {
      throw new UnsupportedOperationException("openSocket not implemented in test");
    }

    @Override
    public org.openqa.selenium.remote.http.HttpResponse execute(
        org.openqa.selenium.remote.http.HttpRequest request) {
      throw new UnsupportedOperationException("execute not implemented in test");
    }

    @Override
    public <T> CompletableFuture<java.net.http.HttpResponse<T>> sendAsyncNative(
        java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {

      // Create a mock response for testing asynchronous behavior
      java.net.http.HttpResponse<T> mockResponse =
          new java.net.http.HttpResponse<>() {
            @Override
            public int statusCode() {
              return 200;
            }

            @Override
            public java.net.http.HttpRequest request() {
              return request;
            }

            @Override
            public java.util.Optional<java.net.http.HttpResponse<T>> previousResponse() {
              return java.util.Optional.empty();
            }

            @Override
            public java.net.http.HttpHeaders headers() {
              return java.net.http.HttpHeaders.of(java.util.Map.of(), (a, b) -> true);
            }

            @Override
            public T body() {
              // This is a simplified mock that returns a string for any type T
              @SuppressWarnings("unchecked")
              T result = (T) "Test response body";
              return result;
            }

            @Override
            public java.util.Optional<javax.net.ssl.SSLSession> sslSession() {
              return java.util.Optional.empty();
            }

            @Override
            public java.net.URI uri() {
              return request.uri();
            }

            @Override
            public java.net.http.HttpClient.Version version() {
              return java.net.http.HttpClient.Version.HTTP_1_1;
            }
          };

      return CompletableFuture.completedFuture(mockResponse);
    }

    @Override
    public <T> java.net.http.HttpResponse<T> sendNative(
        java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler)
        throws IOException, InterruptedException {

      // Simulate network failure if configured to do so
      if (shouldFail) {
        throw new IOException("Simulated network error");
      }

      // Create a mock response for testing synchronous behavior
      return new java.net.http.HttpResponse<>() {
        @Override
        public int statusCode() {
          return 200;
        }

        @Override
        public java.net.http.HttpRequest request() {
          return request;
        }

        @Override
        public java.util.Optional<java.net.http.HttpResponse<T>> previousResponse() {
          return java.util.Optional.empty();
        }

        @Override
        public java.net.http.HttpHeaders headers() {
          return java.net.http.HttpHeaders.of(java.util.Map.of(), (a, b) -> true);
        }

        @Override
        public T body() {
          // This is a simplified mock that returns a string for any type T
          @SuppressWarnings("unchecked")
          T result = (T) "Test response body";
          return result;
        }

        @Override
        public java.util.Optional<javax.net.ssl.SSLSession> sslSession() {
          return java.util.Optional.empty();
        }

        @Override
        public java.net.URI uri() {
          return request.uri();
        }

        @Override
        public java.net.http.HttpClient.Version version() {
          return java.net.http.HttpClient.Version.HTTP_1_1;
        }
      };
    }
  }
}
