/*
 * Copyright 2004 ThoughtWorks, Inc.
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

package com.thoughtworks.selenium.outbedded;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.embedded.jetty.SeleneseJettyResourceHandler;
import com.thoughtworks.selenium.embedded.jetty.NullStaticContentHandler;
import com.thoughtworks.selenium.embedded.jetty.StaticContentHandler;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.http.RequestLog;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.ServletHttpContext;
import org.mortbay.util.InetAddrPort;
import org.mortbay.util.MultiException;

import java.io.File;
import java.io.IOException;

/**
 * Represents an instance of Jetty Servlet container running in-process
 * @author Ben Griffiths
 */
public class EmbeddedJetty extends ServletContainer {

    private Server server;

    public EmbeddedJetty() {
        configureServer();
    }

    public void installWebApp(File webAppRoot, String contextpath) {
        if (webAppRoot != null) {
            try {
                server.addWebApplication(super.domain, "/"+contextpath, webAppRoot.getAbsolutePath());
            } catch (IOException e) {
                throw new RuntimeException("Exception instantiating Jetty", e);
            }
        }
    }

    private void configureServer() {
        server = new Server();
        try {
            server.addListener(new InetAddrPort(super.domain, super.port));
        } catch (IOException e) {
            throw new RuntimeException("Exception instantiating Jetty", e);
        }

        server.setRequestLog(new RequestLog() {
            public void log(HttpRequest httpRequest, HttpResponse httpResponse, int i) {
            }

            public void start() throws Exception {
            }

            public void stop() {
            }

            public boolean isStarted() {
                return false;
            }
        });
    }

    public CommandProcessor start() {
        try {
            server.start();
            return new CommandBridgeClient(super.buildDriverURL());
        } catch (MultiException e) {
            throw new RuntimeException("Exception starting Jetty. Port blocked by another process?", e);
        }
    }

    public void stop() {
        try {
            server.stop();
        } catch (InterruptedException e) {
            throw new RuntimeException("Jetty Interrupted during stop", e);
        }
    }


}
