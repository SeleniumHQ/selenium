package org.openqa.selenium.internal;

import com.google.common.io.Files;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.Ignore;

import java.io.File;

public class IgnoredTestPrinter {
  public static void main(String[] args) throws Exception {
    IgnoreCollector collector = new IgnoreCollector();

    for (Ignore.Driver driver : Ignore.Driver.values()) {
      new TestSuiteBuilder()
          .addSourceDir("java/client/test")
          .usingDriver(WebDriver.class)
          .exclude(driver)
          .withIgnoredTestCallback(collector)
          .create()
      ;
    }


    final File out = new File("ignores.json");
    Files.write(collector.toJson().getBytes(), out);
    System.out.println("Wrote ignores to " + out.getPath());
  }

}
