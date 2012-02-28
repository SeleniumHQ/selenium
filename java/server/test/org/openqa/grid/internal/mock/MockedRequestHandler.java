package org.openqa.grid.internal.mock;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;

public class MockedRequestHandler extends RequestHandler {


  public MockedRequestHandler(SeleniumBasedRequest request, HttpServletResponse response,
      Registry registry) {
    super(request, response, registry);
  }
  
  public void setSession(TestSession session){
    super.setSession(session);
  }

  @Override
  protected void forwardRequest(TestSession session, RequestHandler handler) throws IOException {
    // do nothing
  }

  @Override
  public void forwardNewSessionRequestAndUpdateRegistry(TestSession session)
      throws NewSessionException {
    // do nothing
  }

}
