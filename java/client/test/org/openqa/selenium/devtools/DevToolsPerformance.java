package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.performance.Performance.*;


import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.performance.Performance;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Set;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsPerformance extends DevToolsInfrastructure {


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
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    devTools.send(disable());
  }

  @Test
  public void testSetTimeDomainsThreadTicksPerformance(){
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));

    devTools.send(disable());
  }

  @Test
  public void testGetMetrics(){
    Set<Metric> metrics = devTools.send(getMetrics());
    System.out.println(metrics);
    devTools.send(enable());
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    metrics = devTools.send(getMetrics());
    System.out.println(metrics);
  }




}
