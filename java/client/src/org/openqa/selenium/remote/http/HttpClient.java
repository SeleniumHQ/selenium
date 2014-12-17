package org.openqa.selenium.remote.http;

import java.io.IOException;
import java.net.URL;

/**
 * Defines a simple client for making HTTP requests.
 */
public interface HttpClient {

  /**
   * Executes the given request.
   *
   * @param request the request to execute.
   * @param followRedirects whether to automatically follow redirects.
   * @return the final response.
   * @throws IOException if an I/O error occurs.
   */
  HttpResponse execute(HttpRequest request, boolean followRedirects) throws IOException;

  /**
   * Creates HttpClient instances.
   */
  interface Factory {

    /**
     * Creates a HTTP client that will send requests to the given URL.
     */
    HttpClient createClient(URL url);
  }
}
