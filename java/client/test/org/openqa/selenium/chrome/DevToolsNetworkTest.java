package org.openqa.selenium.chrome;


import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.network.events.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.Cookie;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

/**
 * Created by aohana
 */

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DevToolsNetworkTest extends DevToolsInfrastructureTest {

  @Test
  public void test1EnableNetwork() {
    devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));

    devTools.send(Network.disable());
  }

  @Test
  public void test2EnableNetworkWithParams() {
    devTools.send(Network.enable(Optional.of(10000000), Optional.of(10000000), Optional.of(10000000)));
  }

  @Test
  public void testFilterUrls() {

    List<String> blockedUrls = new ArrayList<>();
    blockedUrls.add("*://*/*.css");

    devTools.send(Network.setBlockedURLs(blockedUrls));

  }

  @Test
  public void testAddHeaders() {

    Map<String, String> extraHeaders = new HashMap<>();
    extraHeaders.put("headerName", "headerValue");

    devTools.send(Network.setExtraHTTPHeaders(extraHeaders));

  }

  @Test
  public void testCacheDisabled() {

    devTools.send(Network.setCacheDisabled(true));

  }

  @Test
  public void testClearCache() {

    devTools.send(Network.clearBrowserCache());

  }

  @Test
  public void testEmulateNetworkConditions() {

    devTools.send(Network.emulateNetworkConditions(true, 100, 1000, 2000, Optional.empty()));

  }

  @Test
  public void testEmulateNetworkConditionsWithConnectionType() {

    devTools.send(Network.emulateNetworkConditions(true, 100, 1000, 2000, Optional.of(ConnectionType.CELLULAR_3G)));

  }

  @Test
  public void testDisableNetwork() throws InterruptedException {

    devTools.addListener(Network.dataReceived(),
                         dataReceived -> Objects.requireNonNull(dataReceived));

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
    Set<Cookie> cookieSet = devTools.send(Network.getAllCookies());
    List<String> urlss = new ArrayList<>();
    urlss.add(TEST_WEB_SITE_ADDRESS);
//    Set<Cookie> cookieSet2 = devTools.send(Network.getAllCookies(Optional.empty()));
    List<String> certificate = devTools.send(Network.getCertificate(TEST_WEB_SITE_ADDRESS));
    Thread.sleep(2000);
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

    devTools.send(Network.disable());

  }

  @Test
  public void testGetRequestPostData(){
   devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(Network.dataReceived(), dataReceived -> {
      String postData = devTools.send(Network.getRequestPostData(dataReceived.getRequestId().toString()));

      Objects.requireNonNull(postData);
    });
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }


  @Test
  public void testEventDataReceived(){
    devTools.send(Network.disable());
    devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));
    devTools.addListener(Network.eventSourceMessageReceived(),
                         new Consumer<EventSourceMessageReceived>() {
                           @Override
                           public void accept(
                               EventSourceMessageReceived eventSourceMessageReceived) {
                             System.out.println("Hi there :+"+eventSourceMessageReceived.toString());
                           }
                         });
    chromeDriver.get(TEST_WEB_SITE_ADDRESS);
  }
}