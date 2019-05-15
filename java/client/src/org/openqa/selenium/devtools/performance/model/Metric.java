package org.openqa.selenium.devtools.performance.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;
import java.util.Objects;

/**
 * @author : dratler
 * This Class been created according to <a href="https://chromedevtools.github.io/devtools-protocol/tot/Performance#event-metrics">Google chrome documentation</a>
 * Run-time execution metric.
 */
public class Metric {
  /** Metric name */
  private final String name;
  /** Metric value */
  private final Integer value;

  private static final Gson gson = new Gson();

  public Metric(String name , Integer value){
    this.name = Objects.requireNonNull(name, "Metric is missing 'name' property");
    this.value = Objects.requireNonNull(value,"Metric is missing 'value' property");
  }

  public static List<Metric> transform(String json) {
    return gson.fromJson(json,List.class);
  }

  public String getName() {
    return name;
  }

  public Integer getValue() {
    return value;
  }
}

