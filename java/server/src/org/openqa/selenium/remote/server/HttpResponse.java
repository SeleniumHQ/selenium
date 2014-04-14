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

import java.util.HashMap;
import java.util.Map;

public class HttpResponse {

  private final Map<String, String> headers = new HashMap<String, String>();
  private int status = HttpStatusCodes.OK;
  private byte[] data = new byte[0];

  public int getStatus() {
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  public void setHeader(String name, String value) {
    headers.put(name, value);
  }

  public Iterable<String> getHeaderNames() {
    return headers.keySet();
  }

  public String getHeader(String name) {
    return headers.get(name);
  }

  public void setContent(byte[] data) {
    this.data = data;
  }

  public byte[] getContent() {
    return data;
  }
}
