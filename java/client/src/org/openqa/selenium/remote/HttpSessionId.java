package org.openqa.selenium.remote;


public class HttpSessionId {
  public static String getSessionId(String uri) {
    int sessionIndex = uri.indexOf("/session/");
    if (sessionIndex != -1) {
      sessionIndex += "/session/".length();
      int nextSlash = uri.indexOf("/", sessionIndex);
      if (nextSlash != -1) {
        return uri.substring(sessionIndex, nextSlash);
      } else {
        return uri.substring(sessionIndex);
      }

    }
    return null;
  }
}
