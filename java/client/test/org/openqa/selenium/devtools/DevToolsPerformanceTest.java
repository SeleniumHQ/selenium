package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.performance.Performance.disable;
import static org.openqa.selenium.devtools.performance.Performance.enable;
import static org.openqa.selenium.devtools.performance.Performance.getMetrics;

import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.performance.Performance;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;

import java.util.List;
import java.util.Objects;


@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsPerformanceTest extends DevToolsInfrastructureTest {


  @Test
  public void testEnableAndDisablePerformance(){

    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(disable());
  }

  @Test
  public void tesDisablePerformance(){

    devTools.send(disable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(disable());
  }

  @Test
  public void testSetTimeDomainTimeTickPerformance(){
    devTools.send(disable());

    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(disable());
  }

  @Test
  public void testSetTimeDomainsThreadTicksPerformance(){
    devTools.send(disable());
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(disable());
  }

  @Test
  public void testGetMetricsByTimeTicks(){
    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }

  @Test
  public void testGetMetricsByThreadTicks(){
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }





}
