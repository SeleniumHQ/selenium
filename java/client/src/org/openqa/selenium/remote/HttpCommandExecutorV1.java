/*
Copyright 2014 Selenium committers
Copyright 2014 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote;

import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.StringEntity;

import java.io.UnsupportedEncodingException;
import java.net.URL;

/**
 * This implementation reifies HttpCommandExecutor to ensure W3C WebDriver Level 1 conformance.
 * To be merged to HttpCommandExecutor as soon as all drivers and the server are conformant.
 */
public class HttpCommandExecutorV1 extends HttpCommandExecutor {

  public HttpCommandExecutorV1(URL addressOfRemoteServer) {
    super(addressOfRemoteServer);
  }

  protected HttpUriRequest buildRequest(Command command) throws UnsupportedEncodingException {
    HttpUriRequest httpMethod = new HttpPost(getAddressOfRemoteServer().toString());

    String payload = new BeanToJsonConverter(true).convert(command);
    ((HttpPost) httpMethod).setEntity(new StringEntity(payload, "utf-8"));
    httpMethod.addHeader("Content-Type", "application/json; charset=utf-8");

    return httpMethod;
  }

}
