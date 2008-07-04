package org.openqa.selenium.remote;

public class Context {

  private Object context;

  public Context(Object raw) {
    context = raw;
  }

  public String toString() {
    return context.toString();
  }
}
