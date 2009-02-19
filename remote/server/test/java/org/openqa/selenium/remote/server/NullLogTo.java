package org.openqa.selenium.remote.server;

class NullLogTo implements LogTo {
  public void log(String message) {
    // Do nothing
  }
}
