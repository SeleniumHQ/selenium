package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

/**
 * Provides remote access to the {@link BrowserConnection} API.
 */
public class RemoteBrowserConnection implements BrowserConnection {

  private final ExecuteMethod executeMethod;

  public RemoteBrowserConnection(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public boolean isOnline() {
    return (Boolean) executeMethod.execute(DriverCommand.IS_BROWSER_ONLINE, null);
  }

  @Override
  public void setOnline(boolean online) throws WebDriverException {
    executeMethod.execute(DriverCommand.SET_BROWSER_ONLINE, ImmutableMap.of("state", online));
  }
}
