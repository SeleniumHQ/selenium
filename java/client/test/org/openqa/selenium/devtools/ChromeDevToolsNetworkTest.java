package org.openqa.selenium.devtools;


import static org.openqa.selenium.devtools.network.Network.clearBrowserCache;
import static org.openqa.selenium.devtools.network.Network.clearBrowserCookies;
import static org.openqa.selenium.devtools.network.Network.continueInterceptedRequest;
import static org.openqa.selenium.devtools.network.Network.dataReceived;
import static org.openqa.selenium.devtools.network.Network.deleteCookies;
import static org.openqa.selenium.devtools.network.Network.disable;
import static org.openqa.selenium.devtools.network.Network.emulateNetworkConditions;
import static org.openqa.selenium.devtools.network.Network.enable;
import static org.openqa.selenium.devtools.network.Network.eventSourceMessageReceived;
import static org.openqa.selenium.devtools.network.Network.getAllCookies;
import static org.openqa.selenium.devtools.network.Network.getCertificate;
import static org.openqa.selenium.devtools.network.Network.getCookies;
import static org.openqa.selenium.devtools.network.Network.getRequestPostData;
import static org.openqa.selenium.devtools.network.Network.getResponseBody;
import static org.openqa.selenium.devtools.network.Network.loadingFailed;
import static org.openqa.selenium.devtools.network.Network.loadingFinished;
import static org.openqa.selenium.devtools.network.Network.requestIntercepted;
import static org.openqa.selenium.devtools.network.Network.requestServedFromCache;
import static org.openqa.selenium.devtools.network.Network.requestWillBeSent;
import static org.openqa.selenium.devtools.network.Network.resourceChangedPriority;
import static org.openqa.selenium.devtools.network.Network.responseReceived;
import static org.openqa.selenium.devtools.network.Network.searchInResponseBody;
import static org.openqa.selenium.devtools.network.Network.setBlockedURLs;
import static org.openqa.selenium.devtools.network.Network.setBypassServiceWorker;
import static org.openqa.selenium.devtools.network.Network.setCacheDisabled;
import static org.openqa.selenium.devtools.network.Network.setCookie;
import static org.openqa.selenium.devtools.network.Network.setDataSizeLimitsForTest;
import static org.openqa.selenium.devtools.network.Network.setExtraHTTPHeaders;
import static org.openqa.selenium.devtools.network.Network.setRequestInterception;
import static org.openqa.selenium.devtools.network.Network.setUserAgentOverride;
import static org.openqa.selenium.devtools.network.Network.signedExchangeReceived;
import static org.openqa.selenium.devtools.network.Network.webSocketClosed;
import static org.openqa.selenium.devtools.network.Network.webSocketCreated;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameError;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameReceived;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameSent;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.devtools.network.model.BlockedReason;
import org.openqa.selenium.devtools.network.model.ConnectionType;
import org.openqa.selenium.devtools.network.model.InterceptionStage;
import org.openqa.selenium.devtools.network.model.RequestId;
import org.openqa.selenium.devtools.network.model.RequestPattern;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.network.model.ResponseBody;
import org.openqa.selenium.remote.http.HttpMethod;

import java.util.List;
import java.util.Optional;

public class ChromeDevToolsNetworkTest extends ChromeDevToolsTestBase {

  @Test
  public void getSetDeleteAndClearAllCookies() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    List<Cookie> allCookies = devTools.send(getAllCookies()).asSeleniumCookies();

    Assert.assertEquals(0, allCookies.size());

    Cookie cookieToSet =
        new Cookie.Builder("name", "value")
            .path("/devtools/test")
            .domain("localhost")
            .isHttpOnly(true)
            .build();
    boolean setCookie;
    setCookie = devTools.send(setCookie(cookieToSet, Optional.empty()));
    Assert.assertEquals(true, setCookie);

    Assert.assertEquals(1, devTools.send(getAllCookies()).asSeleniumCookies().size());
    Assert.assertEquals(0, devTools.send(getCookies(Optional.empty())).asSeleniumCookies().size());

    devTools.send(deleteCookies("name", Optional.empty(), Optional.of("localhost"),
                                Optional.of("/devtools/test")));

    devTools.send(clearBrowserCookies());

    Assert.assertEquals(0, devTools.send(getAllCookies()).asSeleniumCookies().size());

    setCookie = devTools.send(setCookie(cookieToSet, Optional.empty()));
    Assert.assertEquals(true, setCookie);

    Assert.assertEquals(1, devTools.send(getAllCookies()).asSeleniumCookies().size());

  }

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

  @Test
  public void verifyWebSocketOperations() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.addListener(webSocketCreated(), Assert::assertNotNull);
    devTools.addListener(webSocketFrameReceived(), Assert::assertNotNull);
    devTools.addListener(webSocketClosed(), Assert::assertNotNull);
    devTools.addListener(webSocketFrameError(), Assert::assertNotNull);
    devTools.addListener(webSocketFrameSent(), Assert::assertNotNull);

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

  }

  @Test
  public void verifyRequestPostData() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    final RequestId[] requestIds = new RequestId[1];

    devTools.addListener(requestWillBeSent(), requestWillBeSent -> {
      Assert.assertNotNull(requestWillBeSent);
      if (requestWillBeSent.getRequest().getMethod().equalsIgnoreCase(HttpMethod.POST.name())) {
        requestIds[0] = requestWillBeSent.getRequestId();
      }
    });

    chromeDriver.get(appServer.whereIs("postForm.html"));

    chromeDriver.findElement(By.xpath("/html/body/form/input")).click();

    Assert.assertNotNull(devTools.send(getRequestPostData(requestIds[0])));

  }

  @Test
  public void byPassServiceWorker() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(setBypassServiceWorker(true));

    System.out.println("");

  }

  @Test
  public void dataSizeLimitsForTest() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(setDataSizeLimitsForTest(10000, 100000));

    System.out.println("");

  }

  @Test
  public void verifyEventSourceMessage() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.addListener(eventSourceMessageReceived(), Assert::assertNotNull);

    chromeDriver.get(appServer.whereIs("simpleTest.html"));

  }

  @Test
  public void verifySignedExchangeReceived() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.addListener(signedExchangeReceived(), Assert::assertNotNull);

    chromeDriver.get(appServer.whereIsSecure("simpleTest.html"));

  }

  @Test
  public void verifyResourceChangedPriority() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.addListener(resourceChangedPriority(), Assert::assertNotNull);

    chromeDriver.get(appServer.whereIsSecure("simpleTest.html"));

  }

  @Test
  public void interceptRequestAndContinue() {

    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.addListener(requestIntercepted(),
                         requestIntercepted -> devTools.send(
                             continueInterceptedRequest(requestIntercepted.getInterceptionId(),
                                                        Optional.empty(),
                                                        Optional.empty(),
                                                        Optional.empty(), Optional.empty(),
                                                        Optional.empty(),
                                                        Optional.empty(), Optional.empty())));

    RequestPattern
        requestPattern =
        new RequestPattern("*.css", ResourceType.Stylesheet, InterceptionStage.HeadersReceived);
    devTools.send(setRequestInterception(ImmutableList.of(requestPattern)));

    chromeDriver.get(appServer.whereIs("js/skins/lightgray/content.min.css"));

  }

}
