package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.page.Page.addScriptToEvaluateOnNewDocument;
import static org.openqa.selenium.devtools.page.Page.bringToFront;
import static org.openqa.selenium.devtools.page.Page.captureScreenshot;
import static org.openqa.selenium.devtools.page.Page.captureSnapshot;
import static org.openqa.selenium.devtools.page.Page.clearCompilationCache;
import static org.openqa.selenium.devtools.page.Page.crash;
import static org.openqa.selenium.devtools.page.Page.disable;
import static org.openqa.selenium.devtools.page.Page.domContentEventFired;
import static org.openqa.selenium.devtools.page.Page.enable;
import static org.openqa.selenium.devtools.page.Page.frameAttached;
import static org.openqa.selenium.devtools.page.Page.frameDetached;
import static org.openqa.selenium.devtools.page.Page.frameNavigated;
import static org.openqa.selenium.devtools.page.Page.frameStartedLoading;
import static org.openqa.selenium.devtools.page.Page.frameStoppedLoading;
import static org.openqa.selenium.devtools.page.Page.getLayoutMetrics;
import static org.openqa.selenium.devtools.page.Page.getNavigationHistory;
import static org.openqa.selenium.devtools.page.Page.javascriptDialogClosed;
import static org.openqa.selenium.devtools.page.Page.javascriptDialogOpening;
import static org.openqa.selenium.devtools.page.Page.lifecycleEvent;
import static org.openqa.selenium.devtools.page.Page.loadEventFired;
import static org.openqa.selenium.devtools.page.Page.navigate;
import static org.openqa.selenium.devtools.page.Page.navigatedWithinDocument;
import static org.openqa.selenium.devtools.page.Page.screencastFrame;
import static org.openqa.selenium.devtools.page.Page.windowOpen;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.devtools.page.model.LayoutMetric;
import org.openqa.selenium.devtools.page.model.NavigateEntry;
import org.openqa.selenium.devtools.page.model.NavigationHistory;
import org.openqa.selenium.devtools.page.model.ScriptIdentifier;

import java.util.Optional;

public class ChromeDevToolsPageTest extends ChromeDevToolsTestBase {

  @Test
  public void pageLifeCycle() {
    devTools.addListener(lifecycleEvent(), Assert::assertNotNull);
    devTools.addListener(frameAttached(), Assert::assertNotNull);
    devTools.addListener(frameDetached(), Assert::assertNotNull);
    devTools.addListener(domContentEventFired(), Assert::assertNotNull);
    devTools.addListener(frameStartedLoading(), Assert::assertNotNull);
    devTools.addListener(frameNavigated(), Assert::assertNotNull);
    devTools.addListener(frameStoppedLoading(), Assert::assertNotNull);
    devTools.addListener(loadEventFired(), Assert::assertNotNull);
    devTools.addListener(javascriptDialogOpening(), Assert::assertNotNull);
    devTools.addListener(javascriptDialogClosed(), Assert::assertNotNull);
    devTools.addListener(windowOpen(), Assert::assertNotNull);
    devTools.addListener(navigatedWithinDocument(), Assert::assertNotNull);

    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(bringToFront());
    devTools.send(clearCompilationCache());
    chromeDriver.navigate().to(appServer.whereIs("styledPage.html"));
    chromeDriver.findElement(By.name("searchBox")).sendKeys("test");
    ScriptIdentifier
        out =
        devTools.send(addScriptToEvaluateOnNewDocument("localhost", Optional.empty()));
    Assert.assertNotNull(out);
    LayoutMetric metric = devTools.send(getLayoutMetrics());
    Assert.assertNotNull(metric);
    chromeDriver.findElement(By.name("btn")).click();
    chromeDriver.navigate().to(appServer.whereIs("iframes.html"));
    NavigateEntry
        navigate = devTools.send(
        navigate(appServer.whereIs("rectangles.html"), Optional.empty(), Optional.empty(),
                 Optional.empty()));
    Assert.assertNotNull(navigate);
    NavigationHistory history = devTools.send(getNavigationHistory());
    Assert.assertNotNull(history);
    devTools.send(disable());

  }

  @Test(expected = TimeoutException.class)
  public void pageCrash() {
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
    devTools.send(crash());
    chromeDriver.quit();
  }

  @Test
  public void takeScreenShoot() {
    devTools.addListener(screencastFrame(), Assert::assertNotNull);
    devTools.send(enable());
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    String image = devTools.send(captureSnapshot(Optional.empty()));
    Assert.assertNotNull(image);
    String image2 = devTools.send(
        captureScreenshot(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()));
    Assert.assertNotNull(image2);
    devTools.send(disable());
  }

}
