package org.openqa.selenium.remote.html5;

import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.ExecuteMethod;

/**
 * Provides remote access to the {@link WebStorage} API.
 */
public class RemoteWebStorage implements WebStorage {

  private final ExecuteMethod executeMethod;

  public RemoteWebStorage(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public LocalStorage getLocalStorage() {
    return new RemoteLocalStorage(executeMethod);
  }

  @Override
  public SessionStorage getSessionStorage() {
    return new RemoteSessionStorage(executeMethod);
  }
}
