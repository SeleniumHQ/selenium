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
