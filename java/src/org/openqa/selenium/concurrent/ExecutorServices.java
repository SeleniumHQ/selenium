package org.openqa.selenium.concurrent;

import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.logging.Level.WARNING;

import java.util.concurrent.ExecutorService;
import java.util.logging.Logger;

public class ExecutorServices {

  private static final Logger LOG = Logger.getLogger(ExecutorServices.class.getName());

  public static void shutdownGracefully(String name, ExecutorService service) {
    service.shutdown();
    try {
      if (!service.awaitTermination(5, SECONDS)) {
        LOG.warning(String.format("Failed to shutdown %s", name));
        service.shutdownNow();
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      LOG.log(WARNING, String.format("Failed to shutdown %s", name), e);
      service.shutdownNow();
    }
  }
}
