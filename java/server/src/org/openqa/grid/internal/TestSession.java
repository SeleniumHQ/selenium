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
package org.openqa.grid.internal;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpVersion;
import org.apache.http.ProtocolException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.RedirectHandler;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.web.Hub;

import com.google.common.io.ByteStreams;

/**
 * Represent a running test for the hub/registry. A test session is created when
 * a TestSlot becomes available for a test.
 * 
 * The session is destroyed when the test ends ( ended by the client or timed
 * out)
 * 
 * 
 */
public class TestSession {

	private static final Logger log = Logger.getLogger(TestSession.class.getName());

    private final String internalKey;
	private final TestSlot slot;
	private String externalKey = null;
	private long lastActivity;
	private final Map<String, Object> requestedCapabilities;
	private Map<String, Object> objects = new HashMap<String, Object>();
	private volatile boolean ignoreTimeout = false;

	public String getInternalKey() {
		return internalKey;
	}

	/**
	 * Creates a test session on the specified testSlot.
	 * 
	 * @param slot
	 */
	TestSession(TestSlot slot, Map<String, Object> requestedCapabilities) {
		internalKey = UUID.randomUUID().toString();
		this.slot = slot;
		this.requestedCapabilities = requestedCapabilities;
		lastActivity = System.currentTimeMillis();
	}

	/**
	 * the capabilities the client requested. It will match the TestSlot
	 * capabilities, but is not equals.
	 * 
	 * @return
	 */
	public Map<String, Object> getRequestedCapabilities() {
		return requestedCapabilities;
	}

	/**
	 * Get the session key from the remote. It's up to the remote to guarantee
	 * the key is unique. If 2 remotes return the same session key, the tests
	 * will overwrite each other.
	 * 
	 * @return the key that was provided by the remote when the POST /session
	 *         command was sent.
	 * 
	 */
	public String getExternalKey() {
		return externalKey;
	}

	/**
	 * associate this session to the session provided by the remote.
	 * 
	 * @param externalKey
	 */
	public void setExternalKey(String externalKey) {
		this.externalKey = externalKey;
	}

	/**
	 * give the time in milliseconds since the last access to this test session,
	 * or 0 is ignore time out has been set to true.
	 * 
	 * @see TestSession#setIgnoreTimeout(boolean)
	 * 
	 * @return time in millis
	 */
	public long getInactivityTime() {
		if (ignoreTimeout) {
			return 0;
		} else {
			return System.currentTimeMillis() - lastActivity;
		}

	}

	/**
	 * 
	 * @return the TestSlot this session is executed against.
	 */
	public TestSlot getSlot() {
		return slot;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((internalKey == null) ? 0 : internalKey.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		TestSession other = (TestSession) obj;
		if (!internalKey.equals(other.internalKey))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return externalKey != null ? "ext. key " + externalKey : internalKey + " (int. key, remote not contacted yet.)";
	}

	/**
	 * Forward the request to the remote, execute the TestSessionListeners if
	 * applicable.
	 * 
	 * @param request
	 * @param response
	 * 
	 * @throws IOException
	 */
	public void forward(HttpServletRequest request, HttpServletResponse response) throws IOException {
		forward(request, response, null, false);
	}

	private static ThreadSafeClientConnManager connManager;
	private static HttpParams params;

	private DefaultHttpClient getClient() {
		synchronized (TestSession.class) {
			if (connManager == null) {
				params = new BasicHttpParams();
				HttpConnectionParams.setConnectionTimeout(params, 120 * 1000);
				HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);

				// Create and initialize scheme registry 
				SchemeRegistry schemeRegistry = new SchemeRegistry();
				schemeRegistry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
				
				connManager = new ThreadSafeClientConnManager(params, schemeRegistry);
			}
		}
		DefaultHttpClient client = new DefaultHttpClient(connManager,params);
		client.setRedirectHandler(new RedirectHandler() {
			public boolean isRedirectRequested(HttpResponse response, HttpContext context) {
				return false;
			}

			public URI getLocationURI(HttpResponse response, HttpContext context) throws ProtocolException {
				return null;
			}
		});
		return client;
	}

	/**
	 * Forward the request to the remote.
	 * 
	 * @param request
	 * @param response
	 * @param content
	 *            Overwrite the body. Useful when the body of the request was
	 *            already read.
	 * @param interceptResponseBody
	 *            for selenium1 protocol, you need to read the content of the
	 *            response to find the session.
	 * @return the content of the response if interceptResponseBody=true. null
	 *         otherwise
	 * @throws IOException
	 */
	public String forward(HttpServletRequest request, HttpServletResponse response, String content, boolean interceptResponseBody) throws IOException {
		String res = null;

		if (slot.getProxy() instanceof CommandListener) {
			((CommandListener) slot.getProxy()).beforeCommand(this, request, response);
		}

		lastActivity = System.currentTimeMillis();
		URL remoteURL = slot.getProxy().getRemoteURL();

		String pathSpec = request.getServletPath() + request.getContextPath();
		String path = request.getRequestURI();
		if (!path.startsWith(pathSpec))
			throw new IllegalStateException("Expected path " + path + " to start with pathSpec " + pathSpec);
		String end = path.substring(pathSpec.length());
		String ok = remoteURL + end;
		String uri = new URL(remoteURL, ok).toExternalForm();

		InputStream body = null;
		if (request.getContentLength() > 0 || request.getHeader("Transfer-Encoding") != null) {
			body = request.getInputStream();
        }

		HttpRequest proxyRequest;
		if (content != null) {
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest(request.getMethod(), uri);
			r.setEntity(new StringEntity(content));
			proxyRequest = r;
		} else if (body != null) {
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest(request.getMethod(), uri);
			r.setEntity(new InputStreamEntity(body, request.getContentLength()));
			proxyRequest = r;
		} else {
			BasicHttpRequest r = new BasicHttpRequest(request.getMethod(), uri);
			proxyRequest = r;
		}

		for (Enumeration<?> e = request.getHeaderNames(); e.hasMoreElements();) {
			String headerName = (String) e.nextElement();

            if ("Content-Length".equalsIgnoreCase(headerName)) {
				continue; // already set
            }

            proxyRequest.setHeader(headerName, request.getHeader(headerName));
		}

		DefaultHttpClient client = getClient(); /*
												 * new DefaultHttpClient();
												 * client.setRedirectHandler(new
												 * RedirectHandler() { public
												 * boolean
												 * isRedirectRequested(HttpResponse
												 * response, HttpContext
												 * context) { return false; }
												 * public URI
												 * getLocationURI(HttpResponse
												 * response, HttpContext
												 * context) throws
												 * ProtocolException { return
												 * null; } });
												 */

		HttpHost host = new HttpHost(remoteURL.getHost(), remoteURL.getPort());
		HttpResponse proxyResponse = client.execute(host, proxyRequest);
        lastActivity = System.currentTimeMillis();

		response.setStatus(proxyResponse.getStatusLine().getStatusCode());
		HttpEntity responseBody = proxyResponse.getEntity();

		for (Header header : proxyResponse.getAllHeaders()) {
			String name = header.getName();
			String value = header.getValue();

            // HttpEntity#getContent() chews up the chunk-size octet (i.e., the InputStream does not actually map 1:1
            // to the underlying response body).  This breaks any client expecting the chunk size.  We could try to
            // recreate it, but since the chunks are already read in and decoded, you'd end up with a single chunk, which
            // isn't all that useful.  So, we return the response as a traditional response with a Content-Length header,
            // obviating the need for the Transfer-Encoding header.
            if (name.equalsIgnoreCase("Transfer-Encoding") && value.equalsIgnoreCase("chunked")) {
                continue;
            }

			// the location needs to point to the hub that will proxy
			// everything.
			if (name.equalsIgnoreCase("Location")) {
				URL returnedLocation = new URL(value);
				URL driverLocation = remoteURL;
				String driverPath = driverLocation.getPath();
				String wrongPath = returnedLocation.getPath();
				String correctPath = wrongPath.replace(driverPath, "");
				Hub hub = slot.getProxy().getRegistry().getHub();
				String location = "http://" + hub.getHost() + ":" + hub.getPort() + pathSpec + correctPath;
				response.setHeader(name, location);
			} else {
				response.setHeader(name, value);
			}
		}

		if (responseBody != null) {
			InputStream in = responseBody.getContent();

			if (interceptResponseBody) {
				StringBuilder sb = new StringBuilder();
				String line;
				try {
					InputStream is = in;
					BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
					while ((line = reader.readLine()) != null) {
						// TODO freynaud bug ?
						sb.append(line);/* .append("\n") */
					}
					is.close();
				} catch (UnsupportedEncodingException e) {
					throw new RuntimeException(e);
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
				res = sb.toString();
				in = new ByteArrayInputStream(res.getBytes("UTF-8"));
			}

			try {
				OutputStream out = response.getOutputStream();
				try {
                    byte[] rawBody = ByteStreams.toByteArray(in);

                    // We need to set the Content-Length header before we write to the output stream.  Usually the
                    // Content-Length header is already set because we take it from the proxied request.  But, it won't
                    // be set when we consume chunked content, since that doesn't use Content-Length.  As we're not
                    // going to send a chunked response, we need to set the Content-Length in order for the response
                    // to be valid.
                    if (!response.containsHeader("Content-Length")) {
                        response.setIntHeader("Content-Length", rawBody.length);
                    }

                    out.write(rawBody);
				} finally {
					try {
						out.close();
					} catch (IOException e) {
					}
				}
			} finally {
				try {
					in.close();
				} catch (IOException e) {
				}
			}
		}

		if (slot.getProxy() instanceof CommandListener) {
			((CommandListener) slot.getProxy()).afterCommand(this, request, response);
		}
		return res;
	}

	/**
	 * Allow you to retrieve an object previously stored on the test session.
	 * 
	 * @param key
	 * @return the object you stored
	 */
	public Object get(String key) {
		return objects.get(key);
	}

	/**
	 * Allows you to store an object on the test session.
	 * 
	 * @param key
	 * @param value
	 */
	public void put(String key, Object value) {
		objects.put(key, value);
	}

	/**
	 * Ends this test session for the hub, releasing the resources in the hub /
	 * registry. It does not release anything on the remote. The resources are
	 * released in a separate thread, so the call returns immediatly. It allows
	 * release with long duration not to block the test while the hub is
	 * releasing the resource.
	 * 
	 */
	public void terminate() {
		slot.release();
	}

	/**
	 * shouldn't be use other than in unit tests for the grid. Tests are not
	 * supposed to care about the grid state.
	 * 
	 * use instead
	 * 
	 * @see TestSession#terminate()
	 */
	void terminateSynchronousFOR_TEST_ONLY() {
		slot._release();
	}

	/**
	 * Sends a DELETE session command to the remote, following web driver
	 * protocol.
	 * 
	 * @return true is the remote replied successfully to the request.
	 */
	public boolean sendDeleteSessionRequest() {
		if (externalKey == null) {
			return false;
		}
		URL remoteURL = slot.getProxy().getRemoteURL();
		String uri = remoteURL.toString() + "/session/" + externalKey;
		HttpRequest request = new BasicHttpRequest("DELETE", uri);
		DefaultHttpClient client = new DefaultHttpClient();
		boolean ok = false;
		try {
			HttpResponse response = client.execute(new HttpHost(remoteURL.getHost(), remoteURL.getPort()), request);
			int code = response.getStatusLine().getStatusCode();
			if (code >= 200 && code <= 299) {
				ok = true;
			} else {
				ok = false;
			}
		} catch (Throwable e) {
			ok = false;
			// corrupted or the something else already sent the DELETE.
			log.severe("Error releasing. Server corrupted ?");
		}
		return ok;
	}

	/**
	 * Sends a cmd=testComplete command to the remote, following selenium1
	 * protocol.
	 * 
	 * @return true is the remote replied successfully to the request.
	 */
	public boolean sendSelenium1TestComplete(TestSession session) throws ClientProtocolException, IOException {

		URL url = slot.getProxy().getRemoteURL();
		BasicHttpRequest req = new BasicHttpRequest("POST", url.toExternalForm() + "/?cmd=testComplete&sessionId=" + session.getExternalKey());
		DefaultHttpClient client = new DefaultHttpClient();

		HttpHost host = new HttpHost(url.getHost(), url.getPort());
		HttpResponse response = client.execute(host, req);

		boolean ok = false;
		try {
			int code = response.getStatusLine().getStatusCode();
			if (code >= 200 && code <= 299) {
				ok = true;
			} else {
				ok = false;
			}
		} catch (Throwable e) {
			ok = false;
			// corrupted or the something else already sent the DELETE.
			log.severe("Error releasing. Server corrupted ?");
		}
		return ok;

	}

	/**
	 * allow to bypass time out for this session. ignore = true => the session
	 * will not time out. setIgnoreTimeout(true) also update the lastActivity to
	 * now.
	 * 
	 * @param ignore
	 */
	public void setIgnoreTimeout(boolean ignore) {
		if (!ignore) {
			lastActivity = System.currentTimeMillis();
		}
		this.ignoreTimeout = ignore;

	}

}
