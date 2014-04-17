package org.openqa.selenium.remote.html5;

import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

/**
 * Provides remote access to the {@link ApplicationCache} API.
 */
public class RemoteApplicationCache implements ApplicationCache {

  private final ExecuteMethod executeMethod;

  public RemoteApplicationCache(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public AppCacheStatus getStatus() {
    String result = (String) executeMethod.execute(DriverCommand.GET_APP_CACHE_STATUS, null);
    return AppCacheStatus.valueOf(result);
  }
}
