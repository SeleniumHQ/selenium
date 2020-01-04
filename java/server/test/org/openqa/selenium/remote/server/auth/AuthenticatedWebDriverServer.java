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

package org.openqa.selenium.remote.server.auth;

import org.openqa.selenium.remote.server.WebDriverServlet;
import org.eclipse.jetty.security.AbstractLoginService;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.HashLoginService;
import org.eclipse.jetty.security.authentication.BasicAuthenticator;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.util.security.Constraint;
import org.eclipse.jetty.util.security.Password;

import java.security.Principal;

import javax.security.auth.Subject;


public class AuthenticatedWebDriverServer {

  public static void main(String[] args) throws Exception {
    Server server = new Server();

    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory());
    http.setPort(4444);
    server.addConnector(http);

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
    Principal principal = new AbstractLoginService.UserPrincipal("fluffy", new Password("bunny"));
    Subject subject = new Subject();
    loginService.getIdentityService().newUserIdentity(subject, principal, new String[]{ "user" });
    securityHandler.setLoginService(loginService);
    securityHandler.setAuthenticator(new BasicAuthenticator());

    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
    context.setContextPath("/wd/hub");
    context.addServlet(new ServletHolder(WebDriverServlet.class), "/*");
    context.setSecurityHandler(securityHandler);

    server.setHandler(context);
    server.start();
  }
}
