package org.openqa.grid.internal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
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
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;

public class StatusServletTests {

	private static Hub hub;
	private static Registry registry;
	private static RemoteProxy p1;
	private static RemoteProxy p2;
	private static RemoteProxy p3;
	private static RemoteProxy p4;
	private static RemoteProxy customProxy;

	private static URL status;
	private static HttpHost host;

	@BeforeClass
	public static void setup() throws Exception {
		registry = Registry.getNewInstanceForTestOnly();
		hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), registry);

		status = new URL("http://" + hub.getHost() + ":" + hub.getPort() + "/grid/status");
		host = new HttpHost(hub.getHost(), hub.getPort());

		hub.start();

		p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/");
		p2 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/");
		p3 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/");
		p4 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/");

		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> capability = new HashMap<String, Object>();
		capability.put("applicationName", "custom app");
		req.addDesiredCapabilitiy(capability);

		Map<String, Object> config = new HashMap<String, Object>();
		config.put("url", "http://machine5:4444/");
		req.setConfiguration(config);
		customProxy = new MyCustomProxy(req);

		registry.add(p1);
		registry.add(p2);
		registry.add(p3);
		registry.add(p4);
		registry.add(customProxy);
	}

	@Test
	public void testget() throws ClientProtocolException, IOException, JSONException {
		String id = "http://machine1:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		BasicHttpRequest r = new BasicHttpRequest("GET", status.toExternalForm() + "?id=" + id);

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject o = extractObject(response);
		Assert.assertEquals(id, o.get("id"));

	}

	@Test
	public void testGetNegative() throws ClientProtocolException, IOException, JSONException {
		String id = "http://wrongOne:4444/";
		DefaultHttpClient client = new DefaultHttpClient();

		BasicHttpRequest r = new BasicHttpRequest("GET", status.toExternalForm() + "?id=" + id);

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
		
		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", status.toExternalForm());
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
		
		System.out.println("REQUEST "+o.toString());
		BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", status.toExternalForm());
		r.setEntity(new StringEntity(o.toString()));

		HttpResponse response = client.execute(host, r);
		Assert.assertEquals(200, response.getStatusLine().getStatusCode());
		JSONObject res = extractObject(response);

		Assert.assertEquals(MyCustomProxy.MY_BOOLEAN, res.get("getBoolean"));
		Assert.assertEquals(MyCustomProxy.MY_STRING,res.get("getString"));
		// url converted to string
		Assert.assertEquals(MyCustomProxy.MY_URL.toString(), res.get("getURL"));
		

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


