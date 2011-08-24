package org.openqa.selenium.remote.server.auth;

import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.DriverServlet;

import org.eclipse.jetty.http.security.Constraint;
import org.eclipse.jetty.http.security.Password;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.HashLoginService;
import org.eclipse.jetty.security.authentication.BasicAuthenticator;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

public class AuthenticatedWebDriverServer {

  public static void main(String[] args) throws Exception {
    Server server = new Server();

    Connector connector = new SelectChannelConnector();
    connector.setPort(4444);
    server.addConnector(connector);

    Constraint constraint = new Constraint();
    constraint.setName(Constraint.__BASIC_AUTH);
    constraint.setRoles(new String[] {"user"});
    constraint.setAuthenticate(true);

    ConstraintMapping constraintMapping = new ConstraintMapping();
    constraintMapping.setConstraint(constraint);
    constraintMapping.setPathSpec("/*");

    ConstraintSecurityHandler securityHandler = new ConstraintSecurityHandler();
    securityHandler.addConstraintMapping(constraintMapping);

    HashLoginService loginService = new HashLoginService();
    loginService.putUser("fluffy", new Password("bunny"), new String[] {
        "user"
    });
    securityHandler.setLoginService(loginService);
    securityHandler.setAuthenticator(new BasicAuthenticator());

    ServletContextHandler context = new ServletContextHandler(
        ServletContextHandler.SESSIONS);
    context.setContextPath("/wd/hub");
    context.setAttribute(DriverServlet.SESSIONS_KEY,
        new DefaultDriverSessions());
    context.addServlet(new ServletHolder(DriverServlet.class), "/*");
    context.setSecurityHandler(securityHandler);

    server.setHandler(context);
    server.start();
  }
}
