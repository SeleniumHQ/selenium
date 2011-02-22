package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;

import java.net.MalformedURLException;
import java.net.URL;

public class TestBasicAuth extends InternalSelenseTestBase {
	@Test public void testBasicAuth() throws Exception {
    selenium.open(getUrl());
		assertEquals(selenium.getTitle(), "Welcome");
	}

  private String getUrl() throws MalformedURLException {
    AppServer appServer = GlobalTestEnvironment.get().getAppServer();
    URL url = new URL(appServer.whereIs("/selenium-server/tests/html/basicAuth/index.html"));

    return String.format("%s://alice:foo@%s:%d%s",
        url.getProtocol(), url.getHost(), url.getPort(), url.getFile());
  }
}
