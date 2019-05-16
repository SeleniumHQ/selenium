package org.openqa.selenium.chrome;

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


public class DevToolsPerformanceTest extends DevToolsInfrastructureTest {


  @Test
  public void enableAndDisablePerformance(){

    getDevTools().send(enable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getDevTools().send(disable());
  }

  @Test
  public void disablePerformance(){

    getDevTools().send(disable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getDevTools().send(disable());
  }

  @Test
  public void setTimeDomainTimeTickPerformance(){
    getDevTools().send(disable());

    getDevTools().send(Performance.setTimeDomain(TimeDomain.timeTicks));
    getDevTools().send(enable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getDevTools().send(disable());
  }

  @Test
  public void setTimeDomainsThreadTicksPerformance(){
    getDevTools().send(disable());
    getDevTools().send(Performance.setTimeDomain(TimeDomain.threadTicks));
    getDevTools().send(enable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getDevTools().send(disable());
  }

  @Test
  public void getMetricsByTimeTicks(){
    getDevTools().send(Performance.setTimeDomain(TimeDomain.timeTicks));
    getDevTools().send(enable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    List<Metric> metrics = getDevTools().send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    getDevTools().send(disable());
  }

  @Test
  public void getMetricsByThreadTicks(){
    getDevTools().send(Performance.setTimeDomain(TimeDomain.threadTicks));
    getDevTools().send(enable());
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    List<Metric> metrics = getDevTools().send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    getDevTools().send(disable());
  }





}
