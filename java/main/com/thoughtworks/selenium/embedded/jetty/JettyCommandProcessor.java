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

package com.thoughtworks.selenium.embedded.jetty;

import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.http.RequestLog;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.ServletHttpContext;
import org.mortbay.util.InetAddrPort;
import org.mortbay.util.MultiException;

import java.io.File;
import java.io.IOException;

import com.thoughtworks.selenium.embedded.jetty.SeleneseJettyResourceHandler;
import com.thoughtworks.selenium.CommandProcessor;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public class JettyCommandProcessor implements CommandProcessor {

    private Server server;
    private SeleneseJettyResourceHandler seleneseJettyResourceHandler;
    private StaticContentHandler staticContentHandler;

    public JettyCommandProcessor(File webAppRoot, String seleniumContext) {
        this(webAppRoot, seleniumContext, new NullStaticContentHandler());
    }

    public JettyCommandProcessor(File webAppRoot, String seleniumContext, StaticContentHandler staticContentHandler) {
        this.staticContentHandler = staticContentHandler;

        server = new Server();
        try {
            server.addListener(new InetAddrPort("localhost", 8080));
            server.setRequestLog(new RequestLog() {
                public void log(HttpRequest httpRequest, HttpResponse httpResponse, int i) {
                    //System.out.println("--> [ req " + httpRequest.getRequestURL());
                }

                public void start() throws Exception {
                }

                public void stop() {
                }

                public boolean isStarted() {
                    return false;
                }
            });

            seleneseJettyResourceHandler = new SeleneseJettyResourceHandler();

            ServletHttpContext context = new ServletHttpContext();
            // context.addHandler(sha);

            staticContentHandler.addStaticContent(context);
            context.addHandler(seleneseJettyResourceHandler);
            context.setContextPath("/" + seleniumContext + "/*");
            server.addContext(context);
            if (webAppRoot != null) {
                server.addWebApplication("locahost", "/", webAppRoot.getAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception instantiating Jetty", e);
        }

    }


    public String doCommand(String command, String field, String value) {
        return seleneseJettyResourceHandler.doCommand(command, field, value);
    }

    public void start() {
        try {
            server.start();
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
