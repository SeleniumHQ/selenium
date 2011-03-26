/*
Copyright 2007-2011 WebDriver committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.grid.selenium.proxy;

import java.io.IOException;
import java.util.logging.Logger;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.TestSession;


public class WebDriverRemoteProxy extends WebRemoteProxy  {
	private static final Logger log = Logger.getLogger(WebDriverRemoteProxy.class.getName());

  public WebDriverRemoteProxy(RegistrationRequest request) {
		super(request);
	}

	@Override
	public void beforeRelease(TestSession session) {
		// release the resources remotly.
		if (session.getExternalKey() == null) {
			throw new IllegalStateException("No internal key yet. Did the app start properlty?");
		}
		System.err.println("timing out " + session);
		boolean ok = session.sendDeleteSessionRequest();
		if (!ok) {
			log.warning("Error releasing the resources on timeout for session " + session);
		}
	}

	@Override
	public boolean isAlive() {
		BasicHttpRequest r = new BasicHttpRequest("GET", getRemoteURL().toExternalForm());
		System.out.println(getRemoteURL().toExternalForm());
		DefaultHttpClient client = new DefaultHttpClient();
		HttpHost host = new HttpHost(getRemoteURL().getHost(), getRemoteURL().getPort());
		HttpResponse response;
		try {
			response = client.execute(host, r);
		} catch (ClientProtocolException e) {
			return false;
		} catch (IOException e) {
			return false;
		}
		return 500==response.getStatusLine().getStatusCode();
	}

}
