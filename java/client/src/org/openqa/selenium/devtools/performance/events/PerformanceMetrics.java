package org.openqa.selenium.devtools.performance.events;

import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.json.JsonInput;

import java.util.List;
import java.util.Objects;

/**
 * @author : dratler
 * These is the event of Current values of Metrics
 */
public class PerformanceMetrics {
  /** Current values of metrics */
  private List<Metric> metrics;
  /** TimeStamp title */
  private String title;

  public PerformanceMetrics(List<Metric> metrics , String title){
    this.metrics = Objects.requireNonNull(metrics , "'Performance.metrics' require to have metrics ");
    this.title = Objects.requireNonNull(title , "'Performance.metrics' require to have title ");
  }

  private static PerformanceMetrics fromJson(JsonInput input) {
    String request = input.nextString();
    List<Metric> metrics = null;
    String title = null;
    while (input.hasNext()) {

      switch (input.nextName()) {
        case "title" :
          title = input.nextString();
          break;
        case "metrics" :
          input.beginArray();
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new PerformanceMetrics(metrics,title);
  }
}
