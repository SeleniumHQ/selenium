package org.openqa.selenium.grid.node.config;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.service.DriverService;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class NodeOptions {

  public static final Logger LOG = Logger.getLogger(NodeOptions.class.getName());
  private final Config config;

  public NodeOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  public void configure(HttpClient.Factory httpClientFactory, LocalNode.Builder node) {
    if (!config.getBool("node", "detect-drivers").orElse(false)) {
      return;
    }

    addSystemDrivers(httpClientFactory, node);
  }


  private void addSystemDrivers(
      HttpClient.Factory httpClientFactory,
      LocalNode.Builder node) {

    // We don't expect duplicates, but they're fine
    List<WebDriverInfo> infos =
        StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
            .filter(WebDriverInfo::isAvailable)
            .collect(Collectors.toList());

    // Same
    List<DriverService.Builder> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    infos.forEach(info -> {
      Capabilities caps = info.getCanonicalCapabilities();
      builders.stream()
          .filter(builder -> builder.score(caps) > 0)
          .peek(builder -> LOG.info(String.format("Adding %s %d times", caps, info.getMaximumSimultaneousSessions())))
          .forEach(builder -> {
            for (int i = 0; i < info.getMaximumSimultaneousSessions(); i++) {
              node.add(caps, c -> {
                try {
                  DriverService service = builder.build();
                  service.start();

                  RemoteWebDriver driver = new RemoteWebDriver(service.getUrl(), c);

                  return new SessionSpy(httpClientFactory, service, driver);
                } catch (IOException | URISyntaxException e) {
                  throw new RuntimeException(e);
                }
              });
            }
          });
    });
  }

  private static class SessionSpy extends Session implements CommandHandler {
    private final ReverseProxyHandler handler;
    private final DriverService service;
    private final String stop;

    public SessionSpy(
        HttpClient.Factory httpClientFactory,
        DriverService service,
        RemoteWebDriver driver) throws URISyntaxException {
      super(driver.getSessionId(), service.getUrl().toURI(), driver.getCapabilities());
      handler = new ReverseProxyHandler(httpClientFactory.createClient(service.getUrl()));
      this.service = service;

      stop = "/session/" + driver.getSessionId();
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      handler.execute(req, resp);

      if (DELETE == req.getMethod() && stop.equals(req.getUri())) {
        service.stop();
      }
    }
  }


}
