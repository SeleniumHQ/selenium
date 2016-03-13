package org.openqa.grid.internal.utils.configuration;

import com.beust.jcommander.Parameter;

import java.util.Arrays;
import java.util.List;

public class StandaloneConfiguration {

  @Parameter(
    names = "-browserTimeout",
    description = "Number of seconds a browser is allowed to hang (0 means indefinite) while a command is running (example: driver.get(url)). If set, must be greater than or equal to 60. When the timeout is reached while a command is processing, the session will quit.")
  public Integer browserTimeout;

  @Parameter(
    names = "-debug",
    description = "<Boolean> to enable LogLevel.FINE"
  )
  public boolean debug;

  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "This help.")
  public boolean help;

  @Parameter(
    names = "-jettyThreads",
    hidden = true)
  public Integer jettyThreads;

  @Parameter(
    names = "-log",
    description = "The filename to use for logging. Default value is null and indicates logging to STDOUT."
  )
  public String log;

  @Parameter(
    names = "-logLongForm",
    description = "if no log is specified, logLongForm can be set to enable longForm output to STDOUT. Default is false"
  )
  public boolean logLongForm;

  @Parameter(
    names = {"-port"},
    description = "The port number the selenium server should use. Default's to 4444. When role is a grid node default is 5555.")
  public Integer port;

  @Parameter(
    names = "-role",
    description = "server role to run as. Options are hub, node, standalone. Default is standalone"
  )
  public String role;

  @Parameter(
    names = {"-timeout", "-sessionTimeout"},
    description = "<Integer> the timeout in seconds before the hub automatically ends a test that hasn't had any activity in the last X seconds. The browser will be released for another test to use. This typically takes care of the client crashes. For grid hub/node roles, CleanUpCycle must also be set. Default is 1800 (30 minutes)")
  public Integer timeout = 1800;

  /**
   * copy another configuration's values into this one if they are set.
   * @param other
   */
  public void merge(StandaloneConfiguration other) {
    if (other.browserTimeout != null) browserTimeout = other.browserTimeout;
    if (other.jettyThreads != null) jettyThreads = other.jettyThreads;
    if (other.timeout != 1800) timeout = other.timeout;
    // role, port, log, debug and help are not merged, they are only consumed by the immediately running node and can't affect a remote
  }

  public String toString(String prefix, String separator, String postfix) {
    StringBuilder sb = new StringBuilder();
    sb.append(toString(prefix, separator, postfix, "browserTimeout", browserTimeout));
    sb.append(toString(prefix, separator, postfix, "debug", debug));
    sb.append(toString(prefix, separator, postfix, "help", help));
    sb.append(toString(prefix, separator, postfix, "jettyThreads", jettyThreads));
    sb.append(toString(prefix, separator, postfix, "log", log));
    sb.append(toString(prefix, separator, postfix, "logLongForm", logLongForm));
    sb.append(toString(prefix, separator, postfix, "port", port));
    sb.append(toString(prefix, separator, postfix, "role", role));
    sb.append(toString(prefix, separator, postfix, "timeout", timeout));
    return sb.toString();
  }

  @Override
  public String toString() {
    return toString(" -", " ", null);
  }

  public String toHTML(String tag, String separator) {
    return toString(String.format("<%s>", tag), separator, String.format("</%s>", tag));
  }

  public StringBuilder toString(String prefix, String valueDelimeter, String postfix, String name, Object value) {
    StringBuilder sb = new StringBuilder();
    List iterator;
    if (value instanceof List) {
      iterator = (List)value;
    } else {
      iterator = Arrays.asList(value);
    }
    for (Object v : iterator) {
      if (value != null) {
        if (prefix != null)
          sb.append(prefix);
        sb.append(name);
        if (valueDelimeter != null)
          sb.append(valueDelimeter);
        sb.append(value);
        if (postfix != null)
          sb.append(postfix);
        if (postfix != null)
          sb.append(postfix);
      }
    }
    return sb;
  }
}
