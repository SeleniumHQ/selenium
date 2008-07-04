package org.openqa.selenium.remote;

public class Command {

  private SessionId sessionId;
  private Context context;
  private String methodName;
  private Object[] parameters;

  public Command(SessionId sessionId, Context context, String methodName, Object... parameters) {
    this.sessionId = sessionId;
    this.context = context;
    this.methodName = methodName;
    this.parameters = parameters;
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public Context getContext() {
    return context;
  }

  public String getMethodName() {
    return methodName;
  }

  public Object[] getParameters() {
    return parameters;
  }
}
