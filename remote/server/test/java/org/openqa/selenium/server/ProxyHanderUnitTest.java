package org.openqa.selenium.server;

import junit.framework.TestCase;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

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
