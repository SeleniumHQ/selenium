package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.SessionId;

import java.util.Map;

interface ActiveSession extends CommandHandler {

  SessionId getId();

  /**
   * Desribe the current webdriver session's capabilities.
   */
  Map<String, Object> getCapabilities();

  void stop();
}
