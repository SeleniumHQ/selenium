package org.openqa.selenium.remote.http.reactor;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.DomainSocketsTestBase;

public class ReactorClientDomainSocketTest extends DomainSocketsTestBase {

  @Override
  protected HttpClient.Factory createFactory() {
    return new ReactorClient.Factory();
  }
}
