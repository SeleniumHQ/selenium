/*
Copyright 2012 Selenium committers

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
import java.util.Map;

public class FakeHttpRequest implements HttpRequest {

  private String appUri;
  private String uri;
  private String path;
  private String method;

  private Map<String, String> headers = Maps.newHashMap();
  private Map<String, Object> attributes = Maps.newHashMap();

  public String getAppUri() {
    return appUri;
  }

  public void setAppUri(String appUri) {
    this.appUri = appUri;
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getMethod() {
    return method;
  }

  public void setMethod(String method) {
    this.method = method;
  }

  public String getHeader(String header) {
    return headers.get(header);
  }

  public void setHeaders(String name, String value) {
    headers.put(name, value);
  }

  public Object getAttribute(String attributeName) {
    return attributes.get(attributeName);
  }

  public void setAttribute(String attributeName, Object value) {
    attributes.put(attributeName, value);
  }

  public Reader getReader() {
    throw new UnsupportedOperationException();
  }

  public void forward(HttpResponse response, String to) {
    throw new UnsupportedOperationException();
  }
}
