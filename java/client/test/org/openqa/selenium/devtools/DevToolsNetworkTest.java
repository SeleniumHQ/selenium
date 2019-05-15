package org.openqa.selenium.devtools;


import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.network.types.BlockedReason;
import org.openqa.selenium.devtools.network.types.ResourceType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void test1EnableNetwork() {
    devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.send(Network.disable());
  }

  @Test
  public void test2EnableNetworkWithParams() {
    devTools
        .send(Network.enable(Optional.of(10000000), Optional.of(10000000), Optional.of(10000000)));
  }

  @Test
  public void test3Network() {

    List<String> blockedUrls = new ArrayList<>();
    blockedUrls.add("*://*/*.css");

    devTools.send(Network.setBlockedURLs(blockedUrls));

    Map<String, String> extraHeaders = new HashMap<>();
    extraHeaders.put("headerName", "headerValue");

    devTools.send(Network.setExtraHTTPHeaders(extraHeaders));

    devTools.addListener(Network.loadingFailed(), loadingFailed -> {
      if (loadingFailed.getResourceType().equals(ResourceType.Stylesheet)) {
        Assert.assertEquals(loadingFailed.getBlockedReason(), BlockedReason.INSPECTOR);
      }
    });

    devTools.addListener(Network.loadingFinished(), loadingFinished -> {
      Assert.assertNotNull(loadingFinished.getRequestId());
    });

    devTools.addListener(Network.requestWillBeSent(), requestWillBeSent -> {
      if (requestWillBeSent.getRequest().getUrl().equals(TEST_WEB_SITE_ADDRESS)) {
        Assert.assertEquals(requestWillBeSent.getRequest().getHeaders().get("headerName"),
                            "headerValue");
      }
    });

    devTools.addListener(Network.dataReceived(), dataReceived -> {
      Assert.assertNotNull(dataReceived.getRequestId());
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void test4EmulateNetworkConditions() {

    devTools.send(Network.emulateNetworkConditions(true, 100, 1000, 2000, Optional.empty()));
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

    devTools.addListener(Network.loadingFailed(), loadingFailed -> {
      Assert.assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED");
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

  }

}
