package org.openqa.grid.e2e.misc;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import com.google.common.collect.Maps;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class Grid1HeartbeatTests {
	private Hub hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), Registry.getNewInstanceForTestOnly());

	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		hub.start();
	}

    @Test
    public void testIsNotRegistered() throws Exception {
        // Send the heartbeat request when we know that there are no nodes registered with the hub.
        URL heartbeatUrl = new URL(String.format("http://%s:%s/heartbeat?host=localhost&port=5000", hub.getHost(), hub.getPort()));

        HttpRequest request = new HttpGet(heartbeatUrl.toString());

        DefaultHttpClient client = new DefaultHttpClient();
        HttpHost host = new HttpHost(hub.getHost(), hub.getPort());
        HttpResponse response = client.execute(host, request);

        BufferedReader body = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

        Assert.assertEquals(response.getStatusLine().getStatusCode(), 200);
        Assert.assertEquals(body.readLine(), "Hub : Not Registered");
    }

    @Test
    public void testIsRegistered() throws Exception {
        // register a selenium 1
		SelfRegisteringRemote selenium1 = SelfRegisteringRemote.create(SeleniumProtocol.Selenium, PortProber.findFreePort(), hub.getRegistrationURL());
		selenium1.addFirefoxSupport(null);
		selenium1.addFirefoxSupport(new File("c:\\grid\\master"));
		selenium1.addInternetExplorerSupport();
		selenium1.addSafariSupport();
		selenium1.launchRemoteServer();
		selenium1.registerToHub();

        // Check that the node is registered with the hub.
        URL heartbeatUrl = new URL(String.format("http://%s:%s/heartbeat?host=%s&port=%s", hub.getHost(), hub.getPort(),
                new NetworkUtils().getIp4NonLoopbackAddressOfThisMachine().getHostAddress(), selenium1.getPort()));

        HttpRequest request = new HttpGet(heartbeatUrl.toString());

        DefaultHttpClient client = new DefaultHttpClient();
        HttpHost host = new HttpHost(hub.getHost(), hub.getPort());
        HttpResponse response = client.execute(host, request);

        BufferedReader body = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

        Assert.assertEquals(response.getStatusLine().getStatusCode(), 200);
        Assert.assertEquals(body.readLine(), "Hub : OK");
    }
}
