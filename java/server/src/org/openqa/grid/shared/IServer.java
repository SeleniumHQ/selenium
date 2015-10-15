package org.openqa.grid.shared;

public interface IServer {
  void boot() throws Exception;
  void stop();
}
