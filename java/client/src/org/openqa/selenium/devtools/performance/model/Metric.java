package org.openqa.selenium.devtools.performance.model;

/**
 * @author : dratler
 * This Class been created according to <a href="https://chromedevtools.github.io/devtools-protocol/tot/Performance#event-metrics">Google chrome documentation</a>
 * Run-time execution metric.
 */
public class Metric {
  /** Metric name */
  private String name;
  /** Metric value */
  private Integer value;

  public String getName() {
    return name;
  }

  public Integer getValue() {
    return value;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setValue(Integer value) {
    this.value = value;
  }

  @Override
  public String toString(){
    return "{\"name\":"+getName()+",\"value\":"+getValue()+"}";
  }
}

