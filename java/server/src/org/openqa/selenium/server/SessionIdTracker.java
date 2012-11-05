package org.openqa.selenium.server;

class SessionIdTracker {

  private static volatile String lastSessionId;

  public static void setLastSessionId(String sessionId) {
    lastSessionId = sessionId;
  }

  public static String getLastSessionId() {
    return lastSessionId;
  }

}
