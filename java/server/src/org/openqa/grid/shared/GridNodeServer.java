package org.openqa.grid.shared;

public interface GridNodeServer {
  void boot() throws Exception;
  void stop();
}
