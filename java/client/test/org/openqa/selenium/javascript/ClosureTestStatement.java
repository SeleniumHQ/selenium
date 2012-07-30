package org.openqa.selenium.javascript;

import static org.junit.Assert.fail;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import com.google.common.base.Function;
import com.google.common.base.Stopwatch;
import com.google.common.base.Supplier;
import org.junit.runners.model.Statement;

import java.net.URL;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class ClosureTestStatement extends Statement {
  
  private static final Logger LOG = Logger.getLogger(ClosureTestStatement.class.getName());
  
  private final Supplier<WebDriver> driverSupplier;
  private final String testPath;
  private final Function<String, URL> filePathToUrlFn;
  private final long timeoutSeconds;

  public ClosureTestStatement(Supplier<WebDriver> driverSupplier,
      String testPath, Function<String, URL> filePathToUrlFn, long timeoutSeconds) {
    this.driverSupplier = driverSupplier;
    this.testPath = testPath;
    this.filePathToUrlFn = filePathToUrlFn;
    this.timeoutSeconds = Math.max(0, timeoutSeconds);
  }

  @Override
  public void evaluate() throws Throwable {
    URL testUrl = filePathToUrlFn.apply(testPath);
    LOG.info("Running: " + testUrl);
    
    Stopwatch stopwatch = new Stopwatch();
    stopwatch.start();
    
    WebDriver driver = driverSupplier.get();
    JavascriptExecutor executor = (JavascriptExecutor) driver;
    // Avoid Safari JS leak between tests.
    executor.executeScript("if (window && window.top) window.top.G_testRunner = null");

    try {
      driver.get(testUrl.toString());
    } catch (WebDriverException e) {
      fail("Test failed to load: " + e.getMessage());
    }
    
    while (!getBoolean(executor, Query.IS_FINISHED)) {
      long elapsedTime = stopwatch.elapsedTime(TimeUnit.SECONDS);
      if (timeoutSeconds > 0 && elapsedTime > timeoutSeconds) {
        throw new JavaScriptAssertionError("Tests timed out after " + elapsedTime + " s");
      }
      TimeUnit.MILLISECONDS.sleep(100);
    }
    
    if (!getBoolean(executor, Query.IS_SUCCESS)) {
      String report = getString(executor, Query.GET_REPORT);
      throw new JavaScriptAssertionError(report);
    }
  }
  
  private boolean getBoolean(JavascriptExecutor executor, Query query) {
    return (Boolean) executor.executeScript(query.script);
  }

  private String getString(JavascriptExecutor executor, Query query) {
    return (String) executor.executeScript(query.script);
  }

  private static enum Query {
    IS_FINISHED("return !!tr && tr.isFinished();"),
    IS_SUCCESS("return !!tr && tr.isSuccess();"),
    GET_REPORT("return tr.getReport(true);");

    private final String script;

    private Query(String script) {
      this.script = "var tr = window.top.G_testRunner;" + script;
    }
  }
}
