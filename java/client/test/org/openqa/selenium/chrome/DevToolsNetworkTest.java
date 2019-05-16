package org.openqa.selenium.chrome;


import static org.openqa.selenium.devtools.network.Network.dataReceived;
import static org.openqa.selenium.devtools.network.Network.disable;
import static org.openqa.selenium.devtools.network.Network.emulateNetworkConditions;
import static org.openqa.selenium.devtools.network.Network.enable;
import static org.openqa.selenium.devtools.network.Network.eventSourceMessageReceived;
import static org.openqa.selenium.devtools.network.Network.getAllCookies;
import static org.openqa.selenium.devtools.network.Network.getRequestPostData;
import static org.openqa.selenium.devtools.network.Network.loadingFailed;
import static org.openqa.selenium.devtools.network.Network.loadingFinished;
import static org.openqa.selenium.devtools.network.Network.requestIntercepted;
import static org.openqa.selenium.devtools.network.Network.requestWillBeSent;
import static org.openqa.selenium.devtools.network.Network.responseReceived;
import static org.openqa.selenium.devtools.network.Network.setBlockedURLs;
import static org.openqa.selenium.devtools.network.Network.setExtraHTTPHeaders;
import static org.openqa.selenium.devtools.network.Network.webSocketClosed;
import static org.openqa.selenium.devtools.network.Network.webSocketCreated;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameError;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameReceived;
import static org.openqa.selenium.devtools.network.Network.webSocketFrameSent;

import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.network.events.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.events.RequestIntercepted;
import org.openqa.selenium.devtools.network.events.ResponseReceived;
import org.openqa.selenium.devtools.network.events.WebSocketClosed;
import org.openqa.selenium.devtools.network.events.WebSocketCreated;
import org.openqa.selenium.devtools.network.events.WebSocketFrame;
import org.openqa.selenium.devtools.network.events.WebSocketFrameError;
import org.openqa.selenium.devtools.network.types.BlockedReason;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.ResourceType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * Created by aohana
 */

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void test1EnableNetwork() {
    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(disable());
  }

  @Test
  public void test2EnableNetworkWithParams() {
    devTools
        .send(enable(Optional.of(10000000), Optional.of(10000000), Optional.of(10000000)));
  }

  @Test
  public void testFilterUrls() {

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

    devTools.addListener(loadingFinished(), loadingFinished -> {
      Assert.assertNotNull(loadingFinished.getRequestId());
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

  }

  @Test
  public void test4EmulateNetworkConditions() {

    devTools.send(emulateNetworkConditions(true, 100, 1000, 2000, Optional.empty()));

  }

  @Test
  public void testEmulateNetworkConditionsWithConnectionType() {

    devTools.send(emulateNetworkConditions(true, 100, 1000, 2000, Optional.of(ConnectionType.CELLULAR_3G)));

  }

  @Test
  public void testDisableNetwork() throws InterruptedException {

    devTools.addListener(dataReceived(),
                         dataReceived -> Objects.requireNonNull(dataReceived));

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

    devTools.addListener(loadingFailed(), loadingFailed -> {
      Assert.assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED");
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

  }

  @Test
  public void testGetRequestPostData(){
   devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(dataReceived(), dataReceived -> {
      String postData = devTools.send(getRequestPostData(dataReceived.getRequestId()));

      Objects.requireNonNull(postData);
    });
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }


  @Test
  public void testEventDataReceived(){
    devTools.send(disable());
    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(eventSourceMessageReceived(),
                         new Consumer<EventSourceMessageReceived>() {
                           @Override
                           public void accept(
                               EventSourceMessageReceived eventSourceMessageReceived) {
                             System.out.println("Hi there :+"+eventSourceMessageReceived.toString());
                           }
                         });
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }


  @Test
  public void test3Network() {

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

    devTools.addListener(loadingFinished(), loadingFinished -> {
      Assert.assertNotNull(loadingFinished.getRequestId());
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

  }

  //TODO - make this listener to work
  @Test
  public void testRequestIntercepted(){

    devTools.addListener(requestIntercepted(), new Consumer<RequestIntercepted>() {
      @Override
      public void accept(RequestIntercepted requestIntercepted) {
        System.out.println("TEST !!##@@ "+requestIntercepted);
      }
    });
    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    chromeDriver.navigate().back();
  }
  //TODO - make this test to work
  @Test
  public void testResponseReceived(){
    devTools.send(enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(responseReceived(), new Consumer<ResponseReceived>() {
      @Override
      public void accept(ResponseReceived responseReceived) {
        System.out.println("HI :"+responseReceived);
      }
    });
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }

  //TODO - make this test to work
  @Test
  public void testWebSocketFrameError(){
    devTools.send(disable());
    devTools.addListener(webSocketFrameError(), new Consumer<WebSocketFrameError>() {
      @Override
      public void accept(WebSocketFrameError webSocketFrameError) {
        System.out.println("WebSocketError :"+webSocketFrameError);
      }
    });
    devTools.send(getAllCookies());
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
  }

  //TODO - make this test to work
  @Test
  public void testWebSocketCreated(){

    devTools.addListener(webSocketCreated(), new Consumer<WebSocketCreated>() {
      @Override
      public void accept(WebSocketCreated webSocketCreated) {
        System.out.println("Hi "+webSocketCreated);
      }
    });
    devTools.send(enable(Optional.empty(),Optional.empty(),Optional.empty()));
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
  }
  //TODO - make this test to work
  @Test
  public void testWebSocketClosed(){

    devTools.addListener(webSocketClosed(), new Consumer<WebSocketClosed>() {
      @Override
      public void accept(WebSocketClosed webSocketClosed) {
        System.out.println("Closed "+webSocketClosed);
      }
    });
    devTools.send(enable(Optional.empty(),Optional.empty(),Optional.empty()));
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
    devTools.close();
  }

  //TODO - make this test to work
  @Test
  public void testWebSocketFrameReceived(){
    devTools.send(enable(Optional.empty(),Optional.empty(),Optional.empty()));
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
    devTools.send(setBlockedURLs(Arrays.asList("*://*.css")));
    devTools.addListener(webSocketFrameReceived(), new Consumer<WebSocketFrame>() {
      @Override
      public void accept(WebSocketFrame webSocketFrame) {
        System.out.println("WebSocketRecived :" + webSocketFrame);
      }
    });
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
  }

  //TODO - make this test to work
  @Test
  public void testWebSocketFrameSent(){
    devTools.send(enable(Optional.empty(),Optional.empty(),Optional.empty()));
    chromeDriver.navigate().to(TEST_WEB_SITE_ADDRESS);
    devTools.send(setBlockedURLs(Arrays.asList("*://*.css")));
    devTools.addListener(webSocketFrameSent(), new Consumer<WebSocketFrame>() {
      @Override
      public void accept(WebSocketFrame webSocketFrame) {
        System.out.println("WebSocketRecived :" + webSocketFrame);
      }
    });
    devTools.send(setBlockedURLs(Arrays.asList("*://*.css")));
  }
}