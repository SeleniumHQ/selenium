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

import java.io.File;
import java.net.InetAddress;
import java.net.UnknownHostException;

import junit.framework.Assert;

import org.mortbay.jetty.Connector;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.jetty.webapp.WebAppContext;

public class Jetty6AppServer implements AppServer {
    private final int port;
    private File path;
    private final Server server = new Server();

    public Jetty6AppServer() {
        port = 3000;
        findRootOfWebApp();

        WebAppContext context = addWebApplication("", path.getAbsolutePath());

        addRedirectorServlet(context);

        addInfinitePagesServlet(context);
    }

    private void findRootOfWebApp() {
        String[] possiblePaths = {
            "common/src/web",
            "../common/src/web",
          };

        for (String potential : possiblePaths) {
            path = new File(potential);
            if (path.exists()) {
                break;
            }
        }

        Assert.assertTrue("Unable to find common web files. These are located in the common directory", path.exists());
    }

    private void addRedirectorServlet(WebAppContext context) {
        try {
            context.addServlet(RedirectServlet.class, "/redirect");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void addInfinitePagesServlet(WebAppContext context) {
        try {
            context.addServlet(PageServlet.class, "/page/*");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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

    public String getBaseUrl() {
        return "http://" + getHostName() + ":" + port + "/";
    }

    public String getAlternateBaseUrl() {
    	return "http://" + getAlternateHostName() + ":" + port + "/";
    }
    
    public void start() {
        listenOn(port);

        try {
            server.start();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected void listenOn(int thisPort) {
    	SelectChannelConnector connector = new SelectChannelConnector();
        connector.setPort(port);
        server.addConnector(connector);
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
