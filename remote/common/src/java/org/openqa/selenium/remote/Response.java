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
