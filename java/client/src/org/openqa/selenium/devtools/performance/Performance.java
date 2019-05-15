package org.openqa.selenium.devtools.performance;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;

import java.util.List;
import java.util.Objects;

/**
 * @author : dratler
 *  All available DevTools Network methods and events <a href="https://chromedevtools.github.io/devtools-protocol/tot/Performance">Google Documentation</a>
 */
public class Performance {

  public Performance(){}

  /**
   * Disable collecting and reporting metrics.
   */
  public static Command<Void> disable() {
    return new Command<>("Performance.disable", ImmutableMap.of());
  }

  /**
   * Enable collecting and reporting metrics.
   */
  public static Command<Void> enable() {
    return new Command<>("Performance.enable", ImmutableMap.of());
  }

  /**
   * Warning this is an Experimental Method
   * Sets time domain to use for collecting and reporting duration metrics. Note that this must be called before enabling metrics collection.
   * Calling this method while metrics collection is enabled returns an error.EXPERIMENTAL
   * @param timeDomain - {@link TimeDomain}
   */
  public static Command<Void> setTimeDomain(TimeDomain timeDomain) {
    Objects.requireNonNull(timeDomain, "'timeDomain' must be set");
    return new Command<>("Performance.setTimeDomain", ImmutableMap.of("timeDomain", timeDomain.name()));
  }

  /**
   * Retrieve current values of run-time metrics.
   * @return List of {@link List}
   */
  public static Command<List<Metric>> getMetrics(){
    return new Command<>("Performance.getMetrics", ImmutableMap.of(), map("metrics", new TypeToken<List<Metric>>() {}.getType()));
  }

}
