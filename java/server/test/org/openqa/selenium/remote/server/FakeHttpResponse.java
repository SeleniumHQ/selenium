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

import java.nio.charset.Charset;

public class FakeHttpResponse implements HttpResponse {

  private int status = 200;
  private String contentType;
  private byte[] content;
  private Charset encoding;
  private boolean terminated;

  public int getStatus() {
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  public String getContentType() {
    return contentType;
  }

  public void setContentType(String contentType) {
    this.contentType = contentType;
  }

  public byte[] getContent() {
    return content;
  }

  public void setContent(byte[] content) {
    this.content = content;
  }

  public Charset getEncoding() {
    return encoding;
  }

  public void setEncoding(Charset charset) {
    this.encoding = charset;
  }

  public void setContent(String message) {
    setContent(message.getBytes());
  }

  public void sendRedirect(String to) {
    throw new UnsupportedOperationException();
  }

  public void end() {
    terminated = true;
  }

  public boolean isTerminated() {
    return terminated;
  }
}
