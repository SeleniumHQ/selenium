package org.openqa.selenium;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;


import java.lang.reflect.Method;
import java.util.logging.Level;

public class ReflectionBackedDriverSupplier implements Supplier<WebDriver> {

  private final Class<? extends WebDriver> driverClass;

  public ReflectionBackedDriverSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }

  public WebDriver get() {
    try {
      Class[] args = {Level.class};
      Method setLogLevel = null;
      try {
        setLogLevel = driverClass.getMethod("setLogLevel", args);
      } catch (NoSuchMethodException e) {
        // This is handled by the setLogLevel == null case
      }
      if (setLogLevel != null) {
        String value = System.getProperty("log_level", "");
        // Leave logging off by default.
        Level level = value.equals("") ? Level.OFF : LogLevel.find(value);
        setLogLevel.invoke(driverClass, level);
      }
      return driverClass.newInstance();
    } catch (Exception e) {
      Throwables.propagate(e);
    }
    throw new IllegalStateException("Should have returned or thrown");
  }

  private enum LogLevel {
    DEBUG("DEBUG", Level.FINE),
    INFO("INFO", Level.INFO),
    WARNING("WARNING", Level.WARNING),
    ERROR("ERROR", Level.SEVERE);


    private final String value;
    private final Level level;
    
    LogLevel(String value, Level level) {
      this.value = value;
      this.level = level;
    }

    static Level find(String value) {
      for (LogLevel l : LogLevel.values()) {
        if (l.value.equalsIgnoreCase(value)) {
          return l.level;
        }
      }
      throw new IllegalArgumentException("Could not find: " + value);
    }
  }
}
