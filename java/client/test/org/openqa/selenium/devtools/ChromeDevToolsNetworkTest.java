package org.openqa.selenium.devtools;


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
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.network.model.ResponseBody;

import java.util.Optional;

public class ChromeDevToolsNetworkTest extends ChromeDevToolsTestBase {

  @Test
  public void sendRequestWithUrlFiltersAndExtraHeadersAndVerifyRequests() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(setBlockedURLs(ImmutableList.of("*://*/*.css")));

    devTools.send(setExtraHTTPHeaders(ImmutableMap.of("headerName", "headerValue")));

    devTools.addListener(loadingFailed(), loadingFailed -> {
      if (loadingFailed.getResourceType().equals(ResourceType.Stylesheet)) {
        Assert.assertEquals(loadingFailed.getBlockedReason(), BlockedReason.inspector);
      }
    });

    devTools.addListener(requestWillBeSent(), requestWillBeSent -> Assert
        .assertEquals(requestWillBeSent.getRequest().getHeaders().get("headerName"),
                      "headerValue"));

    devTools.addListener(dataReceived(),
                         dataReceived -> Assert.assertNotNull(dataReceived.getRequestId()));

    chromeDriver.get(appServer.whereIs("js/skins/lightgray/content.min.css"));

  }

  @Test
  public void emulateNetworkConditionOffline() {

    devTools.send(enable(Optional.of(100000000), Optional.empty(), Optional.empty()));

    devTools.send(
        emulateNetworkConditions(true, 100, 1000, 2000, Optional.of(ConnectionType.cellular3g)));

    devTools.addListener(loadingFailed(), loadingFailed -> Assert
        .assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED"));

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

  }

  @Test
  public void verifyRequestReceivedFromCacheAndResponseBody() {

    final RequestId[] requestIdFromCache = new RequestId[1];
    devTools.send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    devTools.addListener(requestServedFromCache(), requestId -> {
      Assert.assertNotNull(requestId);
      requestIdFromCache[0] = requestId;
    });

    devTools.addListener(loadingFinished(),
                         dataReceived -> Assert.assertNotNull(dataReceived.getRequestId()));

    chromeDriver.get(appServer.whereIsSecure("simpleTest.html"));
    chromeDriver.get(appServer.whereIsSecure("simpleTest.html"));

    ResponseBody responseBody = devTools.send(getResponseBody(requestIdFromCache[0]));
    Assert.assertNotNull(responseBody);

  }

  @Test
  public void verifySearchInResponseBody() {

    final RequestId[] requestIds = new RequestId[1];
    devTools.send(enable(Optional.empty(), Optional.of(100000000), Optional.empty()));

    devTools.addListener(responseReceived(), responseReceived -> {
      Assert.assertNotNull(responseReceived);
      requestIds[0] = responseReceived.getRequestId();
    });

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

    Assert.assertEquals(true, devTools.send(
        searchInResponseBody(requestIds[0], "/", Optional.empty(), Optional.empty())).size()
                              > 0);

  }

  @Test
  public void verifyCacheDisabledAndClearCache() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.of(100000000)));

    devTools.addListener(responseReceived(), responseReceived -> Assert
        .assertEquals(false, responseReceived.getResponse().getFromDiskCache()));

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

    devTools.send(setCacheDisabled(true));

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

    devTools.send(clearBrowserCache());

  }

  @Test
  public void verifyCertificatesAndOverrideUserAgent() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(setUserAgentOverride("userAgent", Optional.empty(), Optional.empty()));

    devTools.addListener(requestWillBeSent(),
                         requestWillBeSent -> Assert.assertEquals("userAgent",
                                                                  requestWillBeSent
                                                                      .getRequest()
                                                                      .getHeaders()
                                                                      .get("User-Agent")));
    chromeDriver.get(appServer.whereIsSecure("simpleTest.html"));

    Assert.assertEquals(true, devTools
                                  .send(getCertificate(appServer.whereIsSecure("simpleTest.html")))
                                  .size() > 0);
  }

  @Test
  public void verifyResponseReceivedEventAndNetworkDisable() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(responseReceived(), Assert::assertNotNull);
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }
}
