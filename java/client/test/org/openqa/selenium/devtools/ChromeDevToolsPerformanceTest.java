package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.performance.Performance.disable;
import static org.openqa.selenium.devtools.performance.Performance.enable;
import static org.openqa.selenium.devtools.performance.Performance.getMetrics;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.performance.Performance;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;

import java.util.List;
import java.util.Objects;


public class ChromeDevToolsPerformanceTest extends ChromeDevToolsTestBase {


  @Test
  public void enableAndDisablePerformance() {

    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void disablePerformance() {

    devTools.send(disable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void setTimeDomainTimeTickPerformance() {
    devTools.send(disable());

    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void setTimeDomainsThreadTicksPerformance() {
    devTools.send(disable());
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void getMetricsByTimeTicks() {
    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }

  @Test
  public void getMetricsByThreadTicks() {
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }


}
