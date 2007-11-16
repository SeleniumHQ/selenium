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

package com.thoughtworks.webdriver.environment.webserver;

import junit.framework.Assert;
import org.mortbay.http.HttpListener;
import org.mortbay.http.SocketListener;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.WebApplicationContext;

import java.io.File;
import java.io.IOException;

public class Jetty5AppServer implements AppServer {
    private final int port;
    private File path;
    private final Server server = new Server();

    public Jetty5AppServer() {
        port = 3000;
        findRootOfWebApp();

        WebApplicationContext context = addWebApplication("", path.getAbsolutePath());

        addRedirectorServlet(context);

        addInfinitePagesServlet(context);

        context.setClassLoaderJava2Compliant(true);
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

    private void addRedirectorServlet(WebApplicationContext context) {
        try {
            context.addServlet("Redirect", "/redirect", RedirectServlet.class.getName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void addInfinitePagesServlet(WebApplicationContext context) {
        try {
            context.addServlet("Pages", "/page/*", PageServlet.class.getName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String getBaseUrl() {
        return "http://localhost:" + port + "/";
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
        SocketListener listener = new SocketListener();
        listener.setPort(port);
        addListener(listener);
    }

    protected void addListener(HttpListener listener) {
        server.addListener(listener);
    }

    public void stop() {
        try {
            server.stop();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

    }

    public void addAdditionalWebApplication(String context, String absolutePath) {
        addWebApplication(context, absolutePath);
    }

    private WebApplicationContext addWebApplication(String contextPath,
                                                    String absolutePath) {
        try {
            return server.addWebApplication(contextPath, absolutePath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
