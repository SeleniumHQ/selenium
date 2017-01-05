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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkState;

import org.openqa.selenium.net.PortProber;

import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.group.ChannelGroup;
import org.jboss.netty.channel.group.DefaultChannelGroup;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;

import java.net.InetSocketAddress;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * The server responsible for communicating with the SafariDriver extension.
 *
 * <p>This class is not thread safe.
 */
class SafariDriverServer {

  private static final Logger LOG = Logger.getLogger(SafariDriverServer.class.getName());

  private final int port;

  private final BlockingQueue<WebSocketConnection> connections =
      new SynchronousQueue<>();

  private ServerBootstrap bootstrap;
  private Channel serverChannel;
  private ChannelGroup channelGroup;
  private int serverPort;

  /**
   * @param port The port the server should be started on, or 0 to use any
   *     free port.
   */
  public SafariDriverServer(int port) {
    checkArgument(port >= 0, "Port must be >= 0: %d", port);
    this.port = port;
  }

  /**
   * Starts the server if it is not already running.
   */
  public void start() {
    start(port);
  }

  private void start(int port) {
    if (serverChannel != null) {
      return;
    }

    serverPort = port == 0 ? PortProber.findFreePort() : port;

    bootstrap = new ServerBootstrap(
        new NioServerSocketChannelFactory(
            Executors.newCachedThreadPool(),
            Executors.newCachedThreadPool()));

    channelGroup = new DefaultChannelGroup();
    bootstrap.setPipelineFactory(new SafariDriverPipelineFactory(
        serverPort, connections, channelGroup));
    serverChannel = bootstrap.bind(new InetSocketAddress(serverPort));

    LOG.info("Server started on port " + serverPort);
  }

  /**
   * Stops the server if it is running.
   */
  public void stop() {
    if (bootstrap != null) {
      LOG.info("Stopping server");

      channelGroup.close().awaitUninterruptibly();

      serverChannel.close();
      bootstrap.releaseExternalResources();

      serverChannel = null;
      bootstrap = null;
    }
  }

  /**
   * Returns whether the server is currently running.
   */
  public boolean isRunning() {
    return bootstrap != null;
  }

  public String getUri() {
    checkState(serverChannel != null, "The server is not running; call #start()!");
    return "http://localhost:" + serverPort;
  }

  /**
   * Waits for a new SafariDriverConnection.
   *
   * @param timeout How long to wait for the new connection.
   * @param unit Unit of time for {@code timeout}.
   * @return The new connection.
   * @throws InterruptedException If the timeout expires.
   */
  public WebSocketConnection getConnection(long timeout, TimeUnit unit)
      throws InterruptedException {
    return connections.poll(timeout, unit);
  }
}
