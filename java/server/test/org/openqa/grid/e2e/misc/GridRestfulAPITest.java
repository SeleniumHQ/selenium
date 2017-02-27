package org.openqa.grid.e2e.misc;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.util.EntityUtils;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.internal.HttpClientFactory;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.io.IOException;
import java.net.URL;

public class GridRestfulAPITest {

  private Hub hub;
  private SelfRegisteringRemote node;

  @Before
  public void setup() throws Exception {
    hub = GridTestHelper.getHub();
    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    node.addBrowser(GridTestHelper.getSelenium1FirefoxCapability(), 1);
    node.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
    node.startRemoteServer();
    node.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void testGetHubInformation() throws Exception {
    JsonObject jsonResponse = invoke("hub").getAsJsonObject();
    Assert.assertTrue(jsonResponse.has("configuration"));
    Assert.assertEquals(DefaultCapabilityMatcher.class.getName(),
                        jsonResponse.get("configuration").getAsJsonObject().get("capabilityMatcher").getAsString());
  }

  @Test
  public void testNodeInformation() throws Exception {
    JsonArray jsonResponse = invoke("nodes").getAsJsonArray();
    Assert.assertEquals(1, jsonResponse.size());
    JsonObject nodeJson = jsonResponse.get(0).getAsJsonObject();
    Assert.assertTrue(nodeJson.has("slotUsage"));
    Assert.assertEquals(node.getRemoteURL().toString(), nodeJson.get("id").getAsString());
    JsonObject slotUsage = nodeJson.get("slotUsage").getAsJsonObject();
    Assert.assertEquals(2, slotUsage.get("total").getAsInt());
    Assert.assertEquals(0, slotUsage.get("busy").getAsInt());
    Assert.assertEquals(2, slotUsage.get("breakup").getAsJsonArray().size());
  }

  @Test
  public void testGetProxyDetails() throws Exception {
    String id = node.getRemoteURL().getHost() + ":" + node.getRemoteURL().getPort();
    JsonObject jsonResponse = invoke("proxy/" + id).getAsJsonObject();
    Assert.assertFalse(jsonResponse.isJsonNull());
    id = node.getRemoteURL().toString();
    jsonResponse = invoke("proxy/" + id).getAsJsonObject();
    Assert.assertFalse(jsonResponse.isJsonNull());
    Assert.assertTrue(jsonResponse.has("sessions"));
    Assert.assertTrue(jsonResponse.get("sessions").isJsonArray());
    Assert.assertTrue(jsonResponse.has("slotUsage"));
    Assert.assertTrue(jsonResponse.has("config"));
    JsonObject config = jsonResponse.get("config").getAsJsonObject();
    Assert.assertEquals(hub.getUrl().toString(), config.get("hub").getAsString());
  }

  @Test
  public void testListAllSessions() throws Exception {
    RemoteWebDriver driver = null;
    try {
      String browser = GridTestHelper.getDefaultBrowserCapability().getBrowserName();
      driver = GridTestHelper.getRemoteWebDriver(GridTestHelper.getDefaultBrowserCapability(), hub);
      JsonObject json = invoke("sessions").getAsJsonObject();
      Assert.assertTrue(json.has(driver.getSessionId().toString()));
      JsonObject slotInfo = json.get(driver.getSessionId().toString()).getAsJsonObject();
      Assert.assertEquals(browser, slotInfo.get("browser").getAsString());
    } finally {
      if (driver != null) {
        driver.quit();
      }
    }
  }

  @Test
  public void testSessionDetails() throws Exception {
    RemoteWebDriver driver = null;
    try {
      String browser = GridTestHelper.getDefaultBrowserCapability().getBrowserName();
      driver = GridTestHelper.getRemoteWebDriver(GridTestHelper.getDefaultBrowserCapability(), hub);
      JsonObject json = invoke("session/" + driver.getSessionId()).getAsJsonObject();
      JsonObject reqCaps = json.get("requestedCapabilities").getAsJsonObject();
      Assert.assertTrue(reqCaps.has("browserName"));
      Assert.assertEquals(browser, reqCaps.get("browserName").getAsString());
    } finally {
      if (driver != null) {
        driver.quit();
      }
    }

  }

  private JsonElement invoke(String path) throws IOException {
    URL url = new URL(String.format("http://%s:%s/api/v1/%s",
                                    hub.getConfiguration().host,
                                    hub.getConfiguration().port, path));
    HttpClientFactory httpClientFactory = new HttpClientFactory();
    try {
      HttpRequest request = new HttpGet(url.toString());
      HttpClient client = httpClientFactory.getHttpClient();
      HttpHost host = new HttpHost(hub.getConfiguration().host, hub.getConfiguration().port);
      HttpResponse response = client.execute(host, request);
      return asJson(response.getEntity());
    } finally {
      httpClientFactory.close();
    }

  }

  private JsonElement asJson(HttpEntity entity) throws IOException {
    String string = EntityUtils.toString(entity);
    return new JsonParser().parse(string);
  }

  @After
  public void teardown() throws Exception {
    node.stopRemoteServer();
    hub.stop();
  }

}
