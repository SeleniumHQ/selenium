package org.openqa.selenium.chrome;


import static org.openqa.selenium.devtools.network.Network.dataReceived;
import static org.openqa.selenium.devtools.network.Network.disable;
import static org.openqa.selenium.devtools.network.Network.emulateNetworkConditions;
import static org.openqa.selenium.devtools.network.Network.enable;
import static org.openqa.selenium.devtools.network.Network.getResponseBody;
import static org.openqa.selenium.devtools.network.Network.loadingFailed;
import static org.openqa.selenium.devtools.network.Network.requestWillBeSent;
import static org.openqa.selenium.devtools.network.Network.responseReceived;
import static org.openqa.selenium.devtools.network.Network.setBlockedURLs;
import static org.openqa.selenium.devtools.network.Network.setExtraHTTPHeaders;

import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.network.events.ResponseReceived;
import org.openqa.selenium.devtools.network.types.BlockedReason;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.ResourceType;
import org.openqa.selenium.devtools.network.types.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void testScenario1() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    List<String> blockedUrls = new ArrayList<>();
    blockedUrls.add("*://*/*.css");
    devTools.send(setBlockedURLs(blockedUrls));

    Map<String, String> extraHeaders = new HashMap<>();
    extraHeaders.put("headerName", "headerValue");
    devTools.send(setExtraHTTPHeaders(extraHeaders));

    devTools.addListener(loadingFailed(), loadingFailed -> {
      if (loadingFailed.getResourceType().equals(ResourceType.Stylesheet)) {
        Assert.assertEquals(loadingFailed.getBlockedReason(), BlockedReason.INSPECTOR);
      }
    });

    devTools.addListener(requestWillBeSent(), requestWillBeSent -> {
      if (requestWillBeSent.getRequest().getUrl().equals(TEST_WEB_SITE_ADDRESS)) {
        Assert.assertEquals(requestWillBeSent.getRequest().getHeaders().get("headerName"),
                            "headerValue");
      }
    });

    devTools.addListener(dataReceived(), dataReceived -> {
      Assert.assertNotNull(dataReceived.getRequestId());
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

    devTools.send(disable());
  }

  @Test
  public void testScenario2() {

    devTools.send(enable(Optional.of(100000000), Optional.empty(), Optional.empty()));

    devTools.send(emulateNetworkConditions(true, 100, 1000, 2000, Optional.of(ConnectionType.CELLULAR_3G)));

    devTools.addListener(loadingFailed(), loadingFailed -> {
      Assert.assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED");
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void testScenario3() {

    devTools.send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    devTools.addListener(Network.requestServedFromCache(), Assert::assertNotNull);

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void testScenario4(){

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(responseReceived(), new Consumer<ResponseReceived>() {
      @Override
      public void accept(ResponseReceived responseReceived) {
        ResponseBody responseBody = devTools.send(getResponseBody(responseReceived.getRequestId()));
        responseBody.getBody();
      }
    });
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }
}
