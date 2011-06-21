package org.openqa.grid.selenium.utils;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.selenium.net.NetworkUtils;

public class WebDriverJSONConfigurationUtils {

	/**
	 * load a json file from the resource or file system.
	 * 
	 * @param resource
	 * @return
	 * @throws IOException
	 * @throws JSONException
	 */
	public static JSONObject loadJSON(String resource) throws IOException, JSONException {
		InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);

		if (in == null) {
			in = new FileInputStream(resource);
		}
		if (in == null) {
			throw new RuntimeException(resource + " is not a valid resource.");
		}
		StringBuilder b = new StringBuilder();
		InputStreamReader inputreader = new InputStreamReader(in);
		BufferedReader buffreader = new BufferedReader(inputreader);
		String line;
		while ((line = buffreader.readLine()) != null) {
			b.append(line);
		}

		String json = b.toString();
		JSONObject o = new JSONObject(json);
		return o;
	}

	// freynaud TODO separate loading and validation.
	public static JSONObject parseRegistrationRequest(String resource) throws IOException, JSONException {

		JSONObject o = loadJSON(resource);
		String nodeURL = null;
		int port;
		try {
			JSONObject nodeConfig = o.getJSONObject("configuration");
			nodeURL = (String) nodeConfig.get(RegistrationRequest.REMOTE_URL);
			if (nodeURL != null) {
				URL remoteURL = buildNodeURL(nodeURL);
				nodeConfig.put(RegistrationRequest.REMOTE_URL, remoteURL);
				port = remoteURL.getPort();
			} else {
				if (!nodeConfig.has("port")) {
					throw new RuntimeException("You need to specify a port for the node if you don't specify the remote url.");
				} else {
					port = nodeConfig.getInt("port");
				}
			}
			nodeConfig.put("port", port);
			return o;
		} catch (JSONException e) {
			throw new RuntimeException("Cannot parse JSON object " + o, e);
		}
	}

	private static URL buildNodeURL(String nodeURL) {
		String cleaned = nodeURL.toLowerCase();
		if (hostHasToBeGuessed(cleaned)) {
			NetworkUtils util = new NetworkUtils();
			String host = util.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
			if ("ip".equalsIgnoreCase(cleaned) || "host".equalsIgnoreCase(cleaned) ){
				cleaned = cleaned.replace("ip", host);
				cleaned = cleaned.replace("host", host);	
			}
			
		}
		if (!cleaned.startsWith("http://")) {
			cleaned = "http://" + cleaned;
		}
		if (!cleaned.endsWith("/wd/hub")) {
			cleaned = cleaned + "/wd/hub";
		}
		try {
			URL res = new URL(cleaned);
			return res;
		} catch (MalformedURLException e) {
			throw new RuntimeException("Error cleaning up url " + nodeURL + ", failed after conveting it to " + cleaned);
		}

	}

	private static boolean hostHasToBeGuessed(String nodeURL) {
		if (nodeURL.toLowerCase().contains("ip") || nodeURL.toLowerCase().contains("host")) {
			return true;
		} else {
			return false;
		}
	}

}
