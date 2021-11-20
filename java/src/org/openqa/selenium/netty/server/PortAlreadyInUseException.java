package org.openqa.selenium.netty.server;

import java.io.IOException;
import java.io.UncheckedIOException;

public class PortAlreadyInUseException extends UncheckedIOException {
  public PortAlreadyInUseException(int port, IOException cause) {
    super(String.format("Port %s already in use", port), cause);
  }
}
