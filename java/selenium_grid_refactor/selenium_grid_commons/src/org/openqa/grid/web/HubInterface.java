package org.openqa.grid.web;

import java.net.URL;

import org.openqa.grid.internal.HubRegistryInterface;

public interface HubInterface {

  /**
   * get the registry backing up the hub state.
   *
   * @return The registry
   */
  public abstract HubRegistryInterface getRegistry();

  public abstract int getPort();

  public abstract String getHost();

  public abstract void start() throws Exception;

  public abstract void stop() throws Exception;

  public abstract URL getUrl();

  public abstract URL getRegistrationURL();

}