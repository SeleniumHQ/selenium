package org.openqa.grid.internal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import junit.framework.Assert;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.selenium.net.PortProber;

public class StatusServletTests {

	private static Hub hub;
	private static Registry registry;
	private static RemoteProxy p1;
	private static RemoteProxy p2;
	private static RemoteProxy p3;
	private static RemoteProxy p4;
	private static RemoteProxy customProxy;

	private static URL proxyApi;
	private static URL testSessionApi;
	private static HttpHost host;
	private static TestSession session;

	@BeforeClass
	public static void setup() throws Exception {
		GridHubConfiguration c = new GridHubConfiguration();
		c.setPort(PortProber.findFreePort());
		hub = new Hub(c);
		registry = hub.getRegistry();
		proxyApi = new URL("http://" + hub.getHost() + ":" + hub.getPort() + "/grid/api/proxy");
		testSessionApi = new URL("http://" + hub.getHost() + ":" + hub.getPort() + "/grid/api/testsession");

		host = new HttpHost(hub.getHost(), hub.getPort());

		hub.start();

		p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/",registry);
		p2 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/",registry);
		p3 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/",registry);
		p4 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/",registry);

		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> capability = new HashMap<String, Object>();
		capability.put("browserName", "custom app");
		req.addDesiredCapabilitiy(capability);

		Map<String, Object> config = new HashMap<String, Object>();
		config.put("url", "http://machine5:4444/");
		req.setConfiguration(config);
		customProxy = new MyCustomProxy(req,registry);

		registry.add(p1);
		registry.add(p2);
		registry.add(p3);
		registry.add(p4);
		registry.add(customProxy);

		Map<String, Object> cap = new HashMap<String, Object>();
		cap.put("browserName", "app1");

		MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
		newSessionRequest.setRequestType(RequestType.START_SESSION);
		newSessionRequest.setDesiredCapabilities(cap);
		newSessionRequest.process();
		session = newSessionRequest.getTestSession();
		session.setExternalKey("ext. key");

	}

	@Test
	public void testget() throws ClientProtocolException, IOException, JSONException {
		String id = "http://machine1:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		BasicHttpRequest r = new BasicHttpRequest("GET", proxyApi.toExternalForm() + "?id=" + id);

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject o = extractObject(response);
		Assert.assertEquals(id, o.get("id"));

	}

	@Test
	public void testGetNegative() throws ClientProtocolException, IOException, JSONException {
		String id = "http://wrongOne:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		BasicHttpRequest r = new BasicHttpRequest("GET", proxyApi.toExternalForm() + "?id=" + id);

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject o = extractObject(response);

		Assert.assertEquals(false, o.get("success"));
		// System.out.println(o.get("msg"));

	}

	@Test
	public void testpost() throws ClientProtocolException, IOException, JSONException {
		String id = "http://machine1:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		JSONObject o = new JSONObject();
		o.put("id", id);

		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", proxyApi.toExternalForm());
		r.setEntity(new StringEntity(o.toString()));

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject res = extractObject(response);
		Assert.assertEquals(id, res.get("id"));

	}

	@Test
	public void testpostReflection() throws ClientProtocolException, IOException, JSONException {
		String id = "http://machine5:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		JSONObject o = new JSONObject();
		o.put("id", id);
		o.put("getURL", "");
		o.put("getBoolean", "");
		o.put("getString", "");

		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", proxyApi.toExternalForm());
		r.setEntity(new StringEntity(o.toString()));

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject res = extractObject(response);

		Assert.assertEquals(MyCustomProxy.MY_BOOLEAN, res.get("getBoolean"));
		Assert.assertEquals(MyCustomProxy.MY_STRING, res.get("getString"));
		// url converted to string
		Assert.assertEquals(MyCustomProxy.MY_URL.toString(), res.get("getURL"));

	}

	@Test
	public void testSessionApi() throws ClientProtocolException, IOException, JSONException {
		String s = session.getExternalKey();
		DefaultHttpClient client = new DefaultHttpClient();

		JSONObject o = new JSONObject();
		o.put("session", s);
		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", testSessionApi.toExternalForm());
		r.setEntity(new StringEntity(o.toString()));

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject res = extractObject(response);

		Assert.assertTrue(res.getBoolean("success"));

		Assert.assertNotNull(res.get("internalKey"));
		Assert.assertEquals(s, res.get("session"));
		Assert.assertNotNull(res.get("inactivityTime"));
		Assert.assertEquals(p1.getId(), res.get("proxyId"));
	}

	@Test
	public void testSessionget() throws ClientProtocolException, IOException, JSONException {
		String s = session.getExternalKey();

		DefaultHttpClient client = new DefaultHttpClient();

		String url = testSessionApi.toExternalForm() + "?session=" + URLEncoder.encode( s, "UTF-8");
		BasicHttpRequest r = new BasicHttpRequest("GET", url);

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject o = extractObject(response);

		Assert.assertTrue(o.getBoolean("success"));

		Assert.assertNotNull(o.get("internalKey"));
		Assert.assertEquals(s, o.get("session"));
		Assert.assertNotNull(o.get("inactivityTime"));
		Assert.assertEquals(p1.getId(), o.get("proxyId"));

	}

	@Test
	public void testSessionApiNeg() throws ClientProtocolException, IOException, JSONException {
		String s = "non-existing session";
		DefaultHttpClient client = new DefaultHttpClient();

		JSONObject o = new JSONObject();
		o.put("session", s);
		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", testSessionApi.toExternalForm());
		r.setEntity(new StringEntity(o.toString()));

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject res = extractObject(response);

		Assert.assertFalse(res.getBoolean("success"));

	}

	@AfterClass
	public static void teardown() throws Exception {
		hub.stop();
	}

	private JSONObject extractObject(HttpResponse resp) throws IOException, JSONException {
		BufferedReader rd = new BufferedReader(new InputStreamReader(resp.getEntity().getContent()));
		StringBuffer s = new StringBuffer();
		String line;
		while ((line = rd.readLine()) != null) {
			s.append(line);
		}
		rd.close();
		return new JSONObject(s.toString());
	}

}
