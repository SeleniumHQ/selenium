package org.openqa.selenium.remote.internal;

import org.openqa.selenium.remote.http.HttpClient;

public class OkHttpClientTest extends HttpClientTestBase {

  @Override
  protected HttpClient.Factory createFactory() {
    return new OkHttpClient.Factory();
  }
}
