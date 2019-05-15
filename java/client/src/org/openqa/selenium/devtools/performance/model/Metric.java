package org.openqa.selenium.devtools.performance.model;

import java.util.Objects;

/**
 * @author : dratler
 * This Class been created according to <a href="https://chromedevtools.github.io/devtools-protocol/tot/Performance#event-metrics">Google chrome documentation</a>
 * Run-time execution metric.
 */
public class Metric {

  /** Metric name */
  private  String name;
  /** Metric value */
  private  Integer value;

  public String getName() {
    return name;
  }

  public Integer getValue() {
    return value;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Metric metric = (Metric) o;
    return Objects.equals(name, metric.name) &&
           Objects.equals(value, metric.value);
  }

  @Override
  public int hashCode() {

    return Objects.hash(name, value);
  }

  @Override
  public String toString() {
    return "Metric{" +
           "name='" + name + '\'' +
           ", value=" + value +
           '}';
  }
}

