package org.openqa.selenium.netty.server;

import java.io.IOException;
import java.io.UncheckedIOException;

public class PortAlreadyInUseException extends UncheckedIOException {
  public PortAlreadyInUseException(String host, int port, IOException cause) {
    super(String.format(
      "Could not bind to address or port is already in use. Host %s, Port %s", host, port),
      cause);
  }
}
