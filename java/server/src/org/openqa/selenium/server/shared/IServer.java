package org.openqa.selenium.server.shared;

public interface IServer {
  void boot() throws Exception;
  void stop();
}
