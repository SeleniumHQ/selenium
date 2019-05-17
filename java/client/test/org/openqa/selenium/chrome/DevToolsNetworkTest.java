package org.openqa.selenium.chrome;


import static org.openqa.selenium.devtools.network.Network.clearBrowserCache;
import static org.openqa.selenium.devtools.network.Network.dataReceived;
import static org.openqa.selenium.devtools.network.Network.disable;
import static org.openqa.selenium.devtools.network.Network.emulateNetworkConditions;
import static org.openqa.selenium.devtools.network.Network.enable;
import static org.openqa.selenium.devtools.network.Network.getCertificate;
import static org.openqa.selenium.devtools.network.Network.getResponseBody;
import static org.openqa.selenium.devtools.network.Network.loadingFailed;
import static org.openqa.selenium.devtools.network.Network.loadingFinished;
import static org.openqa.selenium.devtools.network.Network.requestServedFromCache;
import static org.openqa.selenium.devtools.network.Network.requestWillBeSent;
import static org.openqa.selenium.devtools.network.Network.responseReceived;
import static org.openqa.selenium.devtools.network.Network.searchInResponseBody;
import static org.openqa.selenium.devtools.network.Network.setBlockedURLs;
import static org.openqa.selenium.devtools.network.Network.setCacheDisabled;
import static org.openqa.selenium.devtools.network.Network.setExtraHTTPHeaders;
import static org.openqa.selenium.devtools.network.Network.setUserAgentOverride;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.network.model.BlockedReason;
import org.openqa.selenium.devtools.network.model.ConnectionType;
import org.openqa.selenium.devtools.network.model.RequestId;
import org.openqa.selenium.devtools.network.model.RequestWillBeSent;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.network.model.ResponseBody;

import java.util.Optional;
import java.util.function.Consumer;

public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void sendRequestWithUrlFiltersAndExtraHeadersAndVerifyRequests() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    getDevTools().send(setBlockedURLs(ImmutableList.of("*://*/*.css")));

    getDevTools().send(setExtraHTTPHeaders(ImmutableMap.of("headerName", "headerValue")));

    getDevTools().addListener(loadingFailed(), loadingFailed -> {
      if (loadingFailed.getResourceType().equals(ResourceType.Stylesheet)) {
        Assert.assertEquals(loadingFailed.getBlockedReason(), BlockedReason.inspector);
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
  public void verifyRequestReceivedFromCacheAndResponseBody() {

    final RequestId[] requestIdFromCache = new RequestId[1];
    getDevTools().send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    getDevTools().addListener(requestServedFromCache(), requestId -> {
      Assert.assertNotNull(requestId);
      requestIdFromCache[0] = requestId;
    });

    getDevTools().addListener(loadingFinished(),
                              dataReceived -> Assert.assertNotNull(dataReceived.getRequestId()));

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    ResponseBody responseBody = getDevTools().send(getResponseBody(requestIdFromCache[0]));
    Assert.assertNotNull(responseBody);

  }

  @Test
  public void verifySearchInResponseBody() {

    final RequestId[] requestIds = new RequestId[1];
    getDevTools().send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    getDevTools().addListener(responseReceived(), responseReceived -> {
      Assert.assertNotNull(responseReceived);
      requestIds[0] = responseReceived.getRequestId();
    });

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    Assert.assertEquals(true, getDevTools().send(
        searchInResponseBody(requestIds[0], "/", Optional.empty(), Optional.empty())).size()
                              > 0);

  }

  @Test
  public void verifyCacheDisabledAndClearCache() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.of(100000000)));

    getDevTools().addListener(responseReceived(), responseReceived -> Assert
        .assertEquals(false, responseReceived.getResponse().getFromDiskCache()));

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    getDevTools().send(setCacheDisabled(true));

    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    getDevTools().send(clearBrowserCache());

  }

  @Test
  public void verifyCertificatesAndOverrideUserAgent() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    getDevTools().send(setUserAgentOverride("userAgent", Optional.empty(), Optional.empty()));

    getDevTools().addListener(requestWillBeSent(), new Consumer<RequestWillBeSent>() {
      @Override
      public void accept(RequestWillBeSent requestWillBeSent) {
        Assert.assertEquals("userAgent",
                            requestWillBeSent.getRequest().getHeaders().get("User-Agent"));
      }
    });
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);

    Assert.assertEquals(true, getDevTools().send(getCertificate(TEST_WEB_SITE_ADDRESS)).size() > 0);
  }

  @Test
  public void verifyResponseReceivedEventAndNetworkDisable() {

    getDevTools().send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    getDevTools().addListener(responseReceived(), Assert::assertNotNull);
    getChromeDriver().get(TEST_WEB_SITE_ADDRESS);
    getDevTools().send(disable());
  }
}
