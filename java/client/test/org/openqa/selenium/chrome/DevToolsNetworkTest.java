package org.openqa.selenium.chrome;


import static org.openqa.selenium.devtools.network.Network.dataReceived;
import static org.openqa.selenium.devtools.network.Network.disable;
import static org.openqa.selenium.devtools.network.Network.emulateNetworkConditions;
import static org.openqa.selenium.devtools.network.Network.enable;
import static org.openqa.selenium.devtools.network.Network.loadingFailed;
import static org.openqa.selenium.devtools.network.Network.requestServedFromCache;
import static org.openqa.selenium.devtools.network.Network.requestWillBeSent;
import static org.openqa.selenium.devtools.network.Network.responseReceived;
import static org.openqa.selenium.devtools.network.Network.setBlockedURLs;
import static org.openqa.selenium.devtools.network.Network.setExtraHTTPHeaders;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.network.types.BlockedReason;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.ResourceType;

import java.util.Optional;

public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void sendRequestWithUrlFiltersAndExtraHeadersAndVerifyRequests() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    getDevTools().send(setBlockedURLs(ImmutableList.of("*://*/*.css")));

    getDevTools().send(setExtraHTTPHeaders(ImmutableMap.of("headerName", "headerValue")));

    getDevTools().addListener(loadingFailed(), loadingFailed -> {
      if (loadingFailed.getResourceType().equals(ResourceType.Stylesheet)) {
        Assert.assertEquals(loadingFailed.getBlockedReason(), BlockedReason.INSPECTOR);
      }
    });

    getDevTools().addListener(requestWillBeSent(), requestWillBeSent -> {
      if (requestWillBeSent.getRequest().getUrl().equals(TEST_WEB_SITE_ADDRESS)) {
        Assert.assertEquals(requestWillBeSent.getRequest().getHeaders().get("headerName"),
                            "headerValue");
      }
    });

    getDevTools().addListener(dataReceived(),
                              dataReceived -> Assert.assertNotNull(dataReceived.getRequestId()));

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    getDevTools().send(disable());
  }

  @Test
  public void emulateNetworkConditionOffline() {

    getDevTools().send(enable(Optional.of(100000000), Optional.empty(), Optional.empty()));

    getDevTools().send(
        emulateNetworkConditions(true, 100, 1000, 2000, Optional.of(ConnectionType.cellular3g)));

    getDevTools().addListener(loadingFailed(), loadingFailed -> Assert
        .assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED"));

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void verifyRequestReceivedFromCache() {

    getDevTools().send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    getDevTools().addListener(requestServedFromCache(), Assert::assertNotNull);

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void verifyResponseReceivedEvent() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    getDevTools().addListener(responseReceived(), Assert::assertNotNull);
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
  }
}
