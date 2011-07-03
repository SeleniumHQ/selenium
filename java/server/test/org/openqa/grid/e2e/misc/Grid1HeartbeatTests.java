package org.openqa.grid.e2e.misc;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;

import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class Grid1HeartbeatTests {
	private Hub hub;

	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		hub.start();
	}

	@Test
	public void testIsNotRegistered() throws Exception {
		// Send the heartbeat request when we know that there are no nodes
		// registered with the hub.
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
		SelfRegisteringRemote selenium1 = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);
		selenium1.addBrowser(new DesiredCapabilities("*firefox", "3.6", Platform.getCurrent()), 1);
		selenium1.startRemoteServer();
		selenium1.sendRegistrationRequest();

		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);

		// Check that the node is registered with the hub.
		URL heartbeatUrl = new URL(String.format("http://%s:%s/heartbeat?host=%s&port=%s", hub.getHost(), hub.getPort(), selenium1.getConfiguration()
				.get(RegistrationRequest.HOST), selenium1.getConfiguration().get(RegistrationRequest.PORT)));

		HttpRequest request = new HttpGet(heartbeatUrl.toString());

		DefaultHttpClient client = new DefaultHttpClient();
		HttpHost host = new HttpHost(hub.getHost(), hub.getPort());
		HttpResponse response = client.execute(host, request);

		BufferedReader body = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

		Assert.assertEquals(response.getStatusLine().getStatusCode(), 200);
		Assert.assertEquals(body.readLine(), "Hub : OK");
	}
}
