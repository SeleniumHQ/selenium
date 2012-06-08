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
import java.util.logging.Logger;

public class WebbitHttpRequest implements HttpRequest {

  private final static Logger log = Logger.getLogger(WebbitHttpRequest.class.getName());
  private final String basePath;
  private final org.webbitserver.HttpRequest request;
  private final Map<String, Object> attributes = Maps.newHashMap();

  public WebbitHttpRequest(String basePath, org.webbitserver.HttpRequest request) {
    this.basePath = basePath;
    this.request = request;
  }

  public String getAppUri() {
    return basePath;
  }

  public String getUri() {
    return request.uri();
  }

  public String getPath() {
    return request.uri().substring(basePath.length());
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
