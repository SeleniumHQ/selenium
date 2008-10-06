/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.environment.webserver;

import junit.framework.Assert;

import org.mortbay.jetty.Connector;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.security.SslSocketConnector;
import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.jetty.webapp.WebAppContext;

import java.io.File;
import java.net.InetAddress;
import java.net.UnknownHostException;

import javax.servlet.Servlet;

public class Jetty6AppServer implements AppServer {
    private int port;
    private int securePort;
    private File path;
    private final Server server = new Server();
    private WebAppContext context;

    public Jetty6AppServer() {
    path = findRootOfWebApp();

    context = addWebApplication("", path.getAbsolutePath());

    addServlet("Redirecter", "/redirect", RedirectServlet.class);
    addServlet("InfinitePagerServer", "/page/*", PageServlet.class);

    listenOn(3000);
    listenSecurelyOn(3443);
  }


  protected File findRootOfWebApp() {
    String[] possiblePaths = {
        "common/src/web",
        "../common/src/web",
    };

    File current;
    for (String potential : possiblePaths) {
      current = new File(potential);
      if (current.exists()) {
        return current;
      }
    }

    Assert.assertTrue("Unable to find common web files. These are located in the common directory",
                      path.exists());
    return null;
  }

  public String getHostName() {
        return "localhost";
    }

    public String getAlternateHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            throw new RuntimeException(e);
        }
    }

    public String whereIs(String relativeUrl) {
        return "http://" + getHostName() + ":" + port + "/" + relativeUrl;
    }

    public String whereElseIs(String relativeUrl) {
    	return "http://" + getAlternateHostName() + ":" + port + "/" + relativeUrl;
    }

    public String whereIsSecure(String relativeUrl) {
        return "https://" + getHostName() + ":" + securePort + "/" + relativeUrl;
    }

  public void start() {
    SelectChannelConnector connector = new SelectChannelConnector();
    connector.setPort(port);
    server.addConnector(connector);

    File keyStore = new File(findRootOfWebApp(), "../../test/java/keystore");
    if (!keyStore.exists())
      throw new RuntimeException("Cannot find keystore for SSL cert");

    SslSocketConnector secureSocket = new SslSocketConnector();
    secureSocket.setPort(securePort);
    secureSocket.setKeystore(keyStore.getAbsolutePath());
    secureSocket.setPassword("password");
    secureSocket.setKeyPassword("password");
    secureSocket.setTruststore(keyStore.getAbsolutePath());
    secureSocket.setTrustPassword("password");
    server.addConnector(secureSocket);

    try {
      server.start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void listenOn(int port) {
    this.port = port;
  }

  public void listenSecurelyOn(int port) {
    this.securePort = port;
  }


  protected void addListener(Connector listener) {
        server.addConnector(listener);
    }

    public void stop() {
        try {
            server.stop();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

  public void addServlet(String name, String url, Class<? extends Servlet> servletClass) {
    try {
      context.addServlet(servletClass, url);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }


  public void addAdditionalWebApplication(String context, String absolutePath) {
        addWebApplication(context, absolutePath);
    }

    private WebAppContext addWebApplication(String contextPath, String absolutePath) {
    	WebAppContext app = new WebAppContext();
    	app.setContextPath(contextPath);
    	app.setWar(absolutePath);
		server.addHandler(app);
		return app;
    }
}
