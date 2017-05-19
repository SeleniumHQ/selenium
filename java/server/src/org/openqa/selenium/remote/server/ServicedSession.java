package org.openqa.selenium.remote.server;


import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.http.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.W3CHttpResponseCodec;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.remote.service.DriverService;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class ServicedSession implements ActiveSession {

  private final static Logger LOG = Logger.getLogger(ActiveSession.class.getName());

  private final DriverService service;
  private final SessionId id;
  private final SessionCodec codec;
  private final Map<String, Object> capabilities;

  public ServicedSession(
      DriverService service,
      SessionCodec codec,
      SessionId id,
      Map<String, Object> capabilities) {
    this.service = service;
    this.codec = codec;
    this.id = id;
    this.capabilities = capabilities;
  }


  @Override
  public void execute(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    codec.handle(req, resp);
  }

  @Override
  public SessionId getId() {
    return id;
  }

  @Override
  public Map<String, Object> getCapabilities() {
    return capabilities;
  }

  @Override
  public void stop() {
    service.stop();
  }

  public static class Factory implements SessionFactory {

    private final Supplier<? extends DriverService> createService;

    public Factory(String serviceClassName) {
      try {
        Class<? extends DriverService> driverClazz =
            Class.forName(serviceClassName).asSubclass(DriverService.class);

        Method serviceMethod = driverClazz.getMethod("createDefaultService");
        serviceMethod.setAccessible(true);

        this.createService = () -> {
          try {
            return (DriverService) serviceMethod.invoke(null);
          } catch (ReflectiveOperationException e) {
            throw new SessionNotCreatedException(
                "Unable to create new service: " + driverClazz.getSimpleName(), e);
          }
        };
      } catch (ReflectiveOperationException e) {
        throw new SessionNotCreatedException("Cannot find service factory method", e);
      }
    }

    @Override
    public ActiveSession apply(Path path, Set<Dialect> downstreamDialects) {
      DriverService service = createService.get();

      try (InputStream in = new BufferedInputStream(Files.newInputStream(path))) {
        service.start();

        PortProber.waitForPortUp(service.getUrl().getPort(), 30, SECONDS);

        URL url = service.getUrl();

        HttpClient client = new ApacheHttpClient.Factory().createClient(url);

        ProtocolHandshake.Result result = new ProtocolHandshake()
            .createSession(client, in, Files.size(path))
            .orElseThrow(() -> new SessionNotCreatedException("Unable to create session"));

        SessionCodec codec;
        if (downstreamDialects.contains(result.getDialect())) {
          codec = new Passthrough(url);
        } else {

          Dialect dialact = downstreamDialects.iterator().next();

          codec = new ProtocolConverter(
              url,
              getCommandCodec(dialact),
              getResponseCodec(dialact),
              getCommandCodec(result.getDialect()),
              getResponseCodec(result.getDialect()));
        }

        Response response = result.createResponse();
        //noinspection unchecked
        return new ServicedSession(
            service,
            codec,
            new SessionId(response.getSessionId()),
            (Map<String, Object>) response.getValue());
      } catch (IOException e) {
        throw new SessionNotCreatedException("Cannot establish new session", e);
      }
    }

    private CommandCodec<HttpRequest> getCommandCodec(Dialect dialect) {
      switch (dialect) {
        case OSS:
          return new JsonHttpCommandCodec();

        case W3C:
          return new W3CHttpCommandCodec();

        default:
          throw new IllegalStateException("Unknown dialect: " + dialect);
      }
    }

    private ResponseCodec<HttpResponse> getResponseCodec(Dialect dialect) {
      switch (dialect) {
        case OSS:
          return new JsonHttpResponseCodec();

        case W3C:
          return new W3CHttpResponseCodec();

        default:
          throw new IllegalStateException("Unknown dialect: " + dialect);
      }
    }
  }
}
