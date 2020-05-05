package org.openqa.selenium.grid.log;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.ALL_ROLES;

@AutoService(HasRoles.class)
public class LoggingFlags implements HasRoles {

  @Parameter(description = "Configure logging", hidden = true, names = "--configure-logging", arity = 1)
  @ConfigValue(section = "logging", name = "enable")
  private Boolean configureLogging = true;

  @Parameter(description = "Use structured logs", names = "--structured-logs")
  @ConfigValue(section = "logging", name = "structured-logs")
  private Boolean structuredLogs = false;

  @Parameter(description = "Use plain log lines", names = "--plain-logs", arity = 1)
  @ConfigValue(section = "logging", name = "plain-logs")
  private Boolean plainLogs = true;

  @Parameter(description = "Enable trace collection", hidden = true, names = "--tracing", arity = 1)
  @ConfigValue(section = "logging", name = "tracing")
  private Boolean enableTracing = true;

  @Override
  public Set<Role> getRoles() {
    return ALL_ROLES;
  }
}
