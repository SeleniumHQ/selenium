/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

public class Response {

  private boolean isError;
  private Object value;
  private String sessionId;
  private String context;

  public Response() {
  }

  public Response(SessionId sessionId, Context context) {
    this.sessionId = String.valueOf(sessionId);
    this.context = String.valueOf(context);
  }

  public void setError(boolean isError) {
    this.isError = isError;
  }

  public boolean isError() {
    return isError;
  }

  public void setValue(Object value) {
    this.value = value;
  }

  public Object getValue() {
    return value;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }

  public String getSessionId() {
    return sessionId;
  }

  public void setContext(String context) {
    this.context = context;
  }

  public String getContext() {
    return context;
  }

  public String toString() {
    return String.format("(%s %s %s: %s)", getSessionId(), getContext(), isError(), getValue());
  }
}
