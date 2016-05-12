// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium;

import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.handler.ContextHandler;
import org.seleniumhq.jetty9.server.handler.HandlerList;
import org.seleniumhq.jetty9.server.handler.ResourceHandler;
import org.seleniumhq.jetty9.util.resource.Resource;

import java.util.logging.Logger;

public class Main {

  public static void main(String[] args) throws Exception {
    Server server = new Server();
    ServerConnector connector = new ServerConnector(server);
    connector.setPort(8989);
    server.setConnectors(new Connector[] {connector });

    HandlerList handlers = new HandlerList();

    ContextHandler context = new ContextHandler();
    context.setContextPath("/tests");
    ResourceHandler testHandler = new ResourceHandler();
    testHandler.setBaseResource(Resource.newClassPathResource("/tests"));
    context.setHandler(testHandler);
    handlers.addHandler(context);

    ContextHandler coreContext = new ContextHandler();
    coreContext.setContextPath("/core");
    ResourceHandler coreHandler = new ResourceHandler();
    coreHandler.setBaseResource(Resource.newClassPathResource("/core"));
    coreContext.setHandler(coreHandler);
    handlers.addHandler(coreContext);

    server.setHandler(handlers);
    server.start();
  }
}
