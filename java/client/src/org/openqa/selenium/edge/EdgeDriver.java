package org.openqa.selenium.edge;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverCommandExecutor;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.util.Objects;
import java.util.ServiceLoader;
import java.util.stream.StreamSupport;

public class EdgeDriver extends ChromeDriver {

  public EdgeDriver() {
    this(new EdgeOptions());
  }

  public EdgeDriver(EdgeOptions options) {
    super(toExecutor(options), options);
  }

  @Deprecated
  public EdgeDriver(Capabilities capabilities) {
    super(toExecutor(new EdgeOptions(true)), capabilities);
  }

  private static CommandExecutor toExecutor(EdgeOptions options) {
    Objects.requireNonNull(options, "No options to construct executor from");

    org.openqa.selenium.edge.EdgeDriverService.Builder<?, ?> builder =
        StreamSupport.stream(ServiceLoader.load(DriverService.Builder.class).spliterator(), false)
            .filter(b -> b instanceof org.openqa.selenium.edge.EdgeDriverService.Builder)
            .map(b -> (org.openqa.selenium.edge.EdgeDriverService.Builder) b)
            .filter(b -> b.isEdgeHTML() == options.isEdgeHTML())
            .findFirst().orElseThrow(WebDriverException::new);

    if (options.isEdgeHTML())
      return new DriverCommandExecutor(builder.build());

    return new ChromeDriverCommandExecutor(builder.build());
  }
}
