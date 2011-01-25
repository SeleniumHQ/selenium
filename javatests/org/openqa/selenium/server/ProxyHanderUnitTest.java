package org.openqa.selenium.server;

import junit.framework.TestCase;

import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.URI;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.URL;

import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;

public class ProxyHanderUnitTest extends TestCase {

	public void testSendNotFoundSends404ResponseCode() throws Exception {
		ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false);
		HttpResponse httpResponseMock = createMock(HttpResponse.class);
		httpResponseMock.sendError(HttpResponse.__404_Not_Found, "Not found");
		expectLastCall().once();
		replay(httpResponseMock);
		proxyHandler.sendNotFound(httpResponseMock);
		verify(httpResponseMock);
	}

    public void testUnknownHostExceptionDoesNotBubble() throws Exception {
        ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false);
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        HttpResponse response = new HttpResponse() {
            @Override
            public OutputStream getOutputStream() {
                return out;
            }
        };
        HttpRequest request = new HttpRequest();
        request.setMethod("GET");
        request.setURI(new URI("http://does-not-exist.invalidtld/"));
        proxyHandler.handle("foo", "bar", request, response);
    }

    public void testUnknownHostExceptionProvidesUsefulErrorMessage() throws Exception {
        ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false);
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        HttpResponse response = new HttpResponse() {
            @Override
            public OutputStream getOutputStream() {
                return out;
            }
        };
        HttpRequest request = new HttpRequest();
        request.setMethod("GET");
        request.setURI(new URI("http://does-not-exist.invalidtld/"));
        proxyHandler.handle("foo", "bar", request, response);
        
        String responseText = new String(out.toByteArray());
        assertTrue(responseText.contains("Check the address for typing errors"));
    }

    public void testConnectExceptionDoesNotBubble() throws Exception {
        ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false);
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        HttpResponse response = new HttpResponse() {
            @Override
            public OutputStream getOutputStream() {
                return out;
            }
        };
        HttpRequest request = new HttpRequest();
        request.setMethod("GET");
        request.setURI(new URI("http://localhost:60999/"));
        proxyHandler.handle("foo", "bar", request, response);
    }

    public void testConnectExceptionProvidesUsefulErrorMessage() throws Exception {
        ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false);
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        HttpResponse response = new HttpResponse() {
            @Override
            public OutputStream getOutputStream() {
                return out;
            }
        };
        HttpRequest request = new HttpRequest();
        request.setMethod("GET");
        request.setURI(new URI("http://localhost:60999/"));
        proxyHandler.handle("foo", "bar", request, response);

        String responseText = new String(out.toByteArray());
        assertTrue(responseText.contains("The site could be temporarily unavailable or too busy"));
    }

	public void testHandleCallsSendNotFoundWhenAskingForNonExistentResource()
			throws Exception {
		ProxyHandler proxyHandlerMock = createMock(ProxyHandler.class,
                ProxyHandler.class.getDeclaredMethod(
						"sendNotFound", HttpResponse.class));
		
		String pathInContext = "/invalid";
		String pathParams = "";
		HttpRequest httpRequest = new HttpRequest();
		HttpResponse httpResponse = new HttpResponse();
		httpResponse.setAttribute("NotFound", "True");
		
		proxyHandlerMock.sendNotFound(httpResponse);
		expectLastCall().once();
		replay(proxyHandlerMock);
		
		proxyHandlerMock.handle(pathInContext, pathParams, httpRequest,
				httpResponse);
		assertNull(httpResponse.getAttribute("NotFound"));
		verify(proxyHandlerMock);
	}
}
