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

package org.openqa.selenium.grid.node.httpd;

import com.google.auto.service.AutoService;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;

import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.DistributorOptions;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.local.NodeFlags;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.server.W3CCommandHandler;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.SessionMapOptions;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.URL;

@AutoService(CliCommand.class)
public class NodeServer implements CliCommand {

  @Override
  public String getName() {
    return "node";
  }

  @Override
  public String getDescription() {
    return "Adds this server as a node in the selenium grid.";
  }

  @Override
  public Executable configure(String... args) {

    HelpFlags help = new HelpFlags();
    BaseServerFlags serverFlags = new BaseServerFlags(5555);
    NodeFlags nodeFlags = new NodeFlags();

    JCommander commander = JCommander.newBuilder()
        .programName(getName())
        .addObject(help)
        .addObject(serverFlags)
        .addObject(nodeFlags)
        .build();

    return () -> {
      try {
        commander.parse(args);
      } catch (ParameterException e) {
        System.err.println(e.getMessage());
        commander.usage();
        return;
      }

      if (help.displayHelp(commander, System.out)) {
        return;
      }

      Config config = new CompoundConfig(
          new AnnotatedConfig(help),
          new AnnotatedConfig(serverFlags),
          new AnnotatedConfig(nodeFlags),
          new EnvConfig(),
          new ConcatenatingConfig("node", '.', System.getProperties()));

      SessionMapOptions sessionsOptions = new SessionMapOptions(config);
      URL sessionMapUrl = sessionsOptions.getSessionMapUri().toURL();
      SessionMap sessions = new RemoteSessionMap(
          HttpClient.Factory.createDefault().createClient(sessionMapUrl));

      BaseServerOptions serverOptions = new BaseServerOptions(config);

      LocalNode.Builder builder = LocalNode.builder(serverOptions.getExternalUri(), sessions);
      nodeFlags.configure(builder);
      LocalNode node = builder.build();

      DistributorOptions distributorOptions = new DistributorOptions(config);
      URL distributorUrl = distributorOptions.getDistributorUri().toURL();
      Distributor distributor = new RemoteDistributor(
          HttpClient.Factory.createDefault().createClient(distributorUrl));

      Server<?> server = new BaseServer<>(serverOptions);
      server.addHandler(node, (inj, req) -> new W3CCommandHandler(node));
      server.start();

      distributor.add(node);
    };
  }
}
