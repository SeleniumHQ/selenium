package org.openqa.selenium.devtools;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.applicationCache.ApplicationCache;
import org.openqa.selenium.devtools.applicationCache.model.FrameWithManifest;

import java.util.List;

public class ChromeDevToolsApplicationCacheTest extends DevToolsTestBase {

  @Test
  public void getAllCacheData() {
    devTools.addListener(ApplicationCache.applicationCacheStatusUpdated(), Assert::assertNotNull);
    devTools.addListener(ApplicationCache.networkStateUpdated(), Assert::assertNotNull);
    devTools.send(ApplicationCache.enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    driver.navigate().to(appServer.whereIs("simpleTest.html"));
    List<FrameWithManifest> framesWithManifests =
        devTools.send(ApplicationCache.getFramesWithManifests());
  }
}
