package org.openqa.selenium.grid.data;

import org.openqa.selenium.remote.http.HttpResponse;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;

public class NewSessionRequest {

  private final RequestId requestId;
  private final CountDownLatch latch;
  private HttpResponse sessionResponse;

  public NewSessionRequest(RequestId requestId, CountDownLatch latch) {
    this.requestId = requestId;
    this.latch = latch;
  }

  public CountDownLatch getLatch() {
    return latch;
  }

  public void setSessionResponse(HttpResponse sessionResponse) {
    this.sessionResponse = sessionResponse;
  }

  public HttpResponse getSessionResponse() {
    return sessionResponse;
  }

}
