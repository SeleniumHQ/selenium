package org.openqa.selenium.chrome;


import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.network.types.BlockedReason;
import org.openqa.selenium.devtools.network.types.ResourceType;
import org.openqa.selenium.devtools.network.events.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.Cookie;
import org.openqa.selenium.devtools.network.types.ResourceType;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    devTools
        .send(Network.enable(Optional.of(10000000), Optional.of(10000000), Optional.of(10000000)));
  }

  @Test
  public void testFilterUrls() {

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

    devTools.addListener(Network.loadingFailed(), loadingFailed -> {
      Assert.assertEquals(loadingFailed.getErrorText(), "net::ERR_INTERNET_DISCONNECTED");
    });

    chromeDriver.get(TEST_WEB_SITE_ADDRESS);

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