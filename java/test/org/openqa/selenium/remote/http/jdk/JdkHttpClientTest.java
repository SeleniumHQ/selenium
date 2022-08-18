package org.openqa.selenium.remote.http.jdk;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.HttpClientTestBase;

public class JdkHttpClientTest extends HttpClientTestBase {

  @Override
  protected HttpClient.Factory createFactory() {
    return new JdkHttpClient.Factory();
  }
}
