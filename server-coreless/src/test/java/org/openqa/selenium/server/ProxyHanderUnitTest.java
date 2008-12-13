package org.openqa.selenium.server;

import junit.framework.TestCase;
import static org.easymock.classextension.EasyMock.*;

import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;

import java.lang.reflect.Method;

public class ProxyHanderUnitTest extends TestCase {

	public void testSendNotFoundSends404ResponseCode() throws Exception {
		ProxyHandler proxyHandler = new ProxyHandler(true, "", "");
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
				new Method[] { ProxyHandler.class.getDeclaredMethod(
						"sendNotFound", HttpResponse.class) });
		
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
