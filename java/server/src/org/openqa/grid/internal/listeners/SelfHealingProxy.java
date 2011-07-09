package org.openqa.grid.internal.listeners;

import java.util.List;

import org.openqa.grid.common.exception.RemoteException;

/**
 * Defines of how the proxy tries to mitigate system errors like network
 * issues etc. When a proxy implements this interface, the polling will start
 * when the proxy is fully registered to the Registry, ie after the
 * Registration.beforeRegistration() is done.
 */
public interface SelfHealingProxy {

  /**
   * start/restart the polling for the remote proxy. A typical poll will try
   * to contact the remote proxy to see if it's still accessible, but it can
   * have more logic in it, like checking the resource usage ( RAM etc) on the
   * remote.
   */
  public void startPolling();

  /**
   * put the polling on hold.
   */
  public void stopPolling();

  /**
   * Allow to record when something important about the remote state is
   * detected.
   *
   * @param event
   */
  public void addNewEvent(RemoteException event);

  // TODO freynaud pass the list as a param ?

  /**
   * Allow to process the list of all the events that were detected on this
   * Remote so far. A typical implementation of this method will be to put the
   * proxy on hold if the network connection is bad, or to restart the remote
   * if the resources used are too important
   *
   * @param event
   */
  public void onEvent(List<RemoteException> events, RemoteException lastInserted);

}
