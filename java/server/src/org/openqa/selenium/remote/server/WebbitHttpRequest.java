/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.remote.server;

import com.google.common.collect.Maps;

import java.io.Reader;
import java.io.StringReader;
import java.util.Map;

public class WebbitHttpRequest implements HttpRequest {

  private final org.webbitserver.HttpRequest request;
  private final Map<String, Object> attributes = Maps.newHashMap();

  public WebbitHttpRequest(org.webbitserver.HttpRequest request) {
    this.request = request;
  }

  public String getAppUri() {
    throw new UnsupportedOperationException("getAppUri");
  }

  public String getUri() {
    throw new UnsupportedOperationException("getUri");
  }

  public String getPath() {
    throw new UnsupportedOperationException("getPath");
  }

  public String getMethod() {
    return request.method();
  }

  public String getHeader(String header) {
    return request.header(header);
  }

  public Object getAttribute(String attributeName) {
    return attributes.get(attributeName);
  }

  public void setAttribute(String attributeName, Object value) {
    attributes.put(attributeName, value);
  }

  public Reader getReader() {
    return new StringReader(request.body());
  }

  public void forward(HttpResponse response, String to) {
    throw new UnsupportedOperationException("forward");
  }
}
