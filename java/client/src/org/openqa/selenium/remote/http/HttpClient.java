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
	* Closes the connections associated with this client. 
	*
	* @throws  IOException  if an I/O error occurs.
	*/
  void close() throws IOException;

  interface Factory {

    /**
     * Creates a HTTP client that will send requests to the given URL.
     *
     * @param url URL
     * @return HttpClient
     */
    HttpClient createClient(URL url);
  }
}
