package org.openqa.selenium.edge.edgehtml;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class EdgeHTMLDriverService extends org.openqa.selenium.edge.EdgeDriverService {

  /**
   * System property that defines the location of the MicrosoftWebDriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String EDGE_DRIVER_EXE_PROPERTY = "webdriver.edge.driver";

  /**
   * System property that defines the default location where MicrosoftWebDriver output is logged.
   */
  public static final String EDGE_DRIVER_LOG_PROPERTY = "webdriver.edge.logfile";

  /**
   * Boolean system property that defines whether the MicrosoftWebDriver executable should be started
   * with verbose logging.
   */
  public static final String
      EDGE_DRIVER_VERBOSE_LOG_PROPERTY =
      "webdriver.edge.verboseLogging";

  public EdgeHTMLDriverService(File executable, int port, ImmutableList<String> args,
                               ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
  }

  /**
   * Configures and returns a new {@link EdgeHTMLDriverService} using the default configuration. In
   * this configuration, the service will use the MicrosoftWebDriver executable identified by the
   * {@link #EDGE_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new EdgeDriverService using the default configuration.
   */
  public static EdgeHTMLDriverService createDefaultService() {
    return new Builder().build();
  }

  @AutoService(DriverService.Builder.class)
  public static class Builder extends org.openqa.selenium.edge.EdgeDriverService.Builder<
      EdgeHTMLDriverService, EdgeHTMLDriverService.Builder> {

    @Override
    public boolean isEdgeHTML() {
      return true;
    }

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.EDGE.equals(capabilities.getBrowserName())) {
        score++;
      }

      return score;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable("MicrosoftWebDriver", EDGE_DRIVER_EXE_PROPERTY,
                            "https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver",
                            "http://go.microsoft.com/fwlink/?LinkId=619687");
    }

    @Override
    protected ImmutableList<String> createArgs() {
      ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
      argsBuilder.add(String.format("--port=%d", getPort()));

      if (Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY)) {
        argsBuilder.add("--verbose");
      }

      return argsBuilder.build();
    }

    @Override
    protected EdgeHTMLDriverService createDriverService(File exe, int port,
                                                        ImmutableList<String> args,
                                                        ImmutableMap<String, String> environment) {
      try {
        EdgeHTMLDriverService
            service = new EdgeHTMLDriverService(exe, port, args, environment);

        if (getLogFile() != null) {
          service.sendOutputTo(new FileOutputStream(getLogFile()));
        } else {
          String logFile = System.getProperty(EDGE_DRIVER_LOG_PROPERTY);
          if (logFile != null) {
            service.sendOutputTo(new FileOutputStream(logFile));
          }
        }

        return service;
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }

}
