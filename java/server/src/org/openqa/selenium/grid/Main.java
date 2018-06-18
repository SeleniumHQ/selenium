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

package org.openqa.selenium.grid;

import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.server.CommandHandler;

import io.netty.util.internal.logging.InternalLoggerFactory;
import io.netty.util.internal.logging.JdkLoggerFactory;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class Main {

  private static final Logger LOG = Logger.getLogger("Selenium Server");

  public static void main(String[] args) throws InterruptedException, ExecutionException {
    InternalLoggerFactory.setDefaultFactory(JdkLoggerFactory.INSTANCE);

    // Scan looking for the args
    Role role = getRole(args);

    if (role == null) {
      throw new RuntimeException("Eeek!");
    }

    CommandHandler handler = role.build(args);

    Server server = new Server(handler);
    LOG.info(String.format("Starting Selenium Server in %s mode.", role.toString().toLowerCase()));
    Future<Void> closeFuture = server.boot();
    PortProber.waitForPortUp(server.getUrl().getPort(), 30, SECONDS);
    LOG.info(String.format("Ready. Address to connect to is %s", server.getUrl()));
    closeFuture.get();
  }

  private static Role getRole(String[] args) {
    String role = "standalone";

    for (int i = 0; i < args.length; i++) {
      if (args[i].startsWith("-role")) {
        return null;
      }
      if (args[i].startsWith("--role=")) {
        role = args[i].substring("--role=".length());
      } else if (args[i].equals("--role")) {
        i++;  // Increment, because we're going to need this.
        if (i < args.length) {
          role = args[i];
        } else {
          role = null;  // Will cause us to print the usage information.
        }
      }
    }

    return Role.get(role);
  }
}
