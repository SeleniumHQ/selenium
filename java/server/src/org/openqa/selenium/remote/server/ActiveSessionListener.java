package org.openqa.selenium.remote.server;

public abstract class ActiveSessionListener {
  public void onAccess(ActiveSession session) {
  }

  public void onStop(ActiveSession session) {
  }
}
