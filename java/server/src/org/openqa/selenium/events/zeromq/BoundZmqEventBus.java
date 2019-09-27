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

package org.openqa.selenium.events.zeromq;

import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.Type;
import org.openqa.selenium.net.NetworkUtils;
import org.zeromq.SocketType;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import java.util.logging.Logger;

class BoundZmqEventBus implements EventBus {

  public static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private final UnboundZmqEventBus delegate;
  private final ZMQ.Socket xpub;
  private final ZMQ.Socket xsub;
  private final ExecutorService executor;

  BoundZmqEventBus(ZContext context, String publishConnection, String subscribeConnection) {
    String address = new NetworkUtils().getHostAddress();
    Addresses xpubAddr = deriveAddresses(address, publishConnection);
    Addresses xsubAddr = deriveAddresses(address, subscribeConnection);

    LOG.info(String.format("XPUB binding to %s, XSUB binding to %s", xpubAddr, xsubAddr));

    xpub = context.createSocket(SocketType.XPUB);
    xpub.setImmediate(true);
    xpub.bind(xpubAddr.bindTo);

    xsub = context.createSocket(SocketType.XSUB);
    xsub.setImmediate(true);
    xsub.bind(xsubAddr.bindTo);

    executor = Executors.newCachedThreadPool(r -> {
      Thread thread = new Thread(r, "Message Bus Proxy");
      thread.setDaemon(true);
      return thread;
    });
    executor.submit(() -> ZMQ.proxy(xsub, xpub, null));

    delegate = new UnboundZmqEventBus(context, xpubAddr.advertise, xsubAddr.advertise);

    LOG.info("Event bus ready");
  }



  @Override
  public void addListener(Type type, Consumer<Event> onType) {
    delegate.addListener(type, onType);
  }

  @Override
  public void fire(Event event) {
    delegate.fire(event);
  }

  @Override
  public void close() {
    delegate.close();
    executor.shutdown();
    xsub.close();
    xpub.close();
  }

  private Addresses deriveAddresses(String host, String connection) {
    if (connection.startsWith("inproc:")) {
      return new Addresses(connection, connection);
    }

    if (!connection.startsWith("tcp://")) {
      throw new IllegalArgumentException("Connection string must begin with inproc:// or tcp://");
    }

    int length = "tcp://".length();
    int colon = connection.indexOf(":", length);
    if (colon == -1) {
      throw new IllegalArgumentException("Unable to determine hostname from " + connection);
    }
    String hostName = connection.substring(length, colon);

    int port = Integer.parseInt(connection.substring(colon + 1));

    if (!"*".equals(hostName)) {
      host = hostName;
    }

    return new Addresses(
        connection,
        String.format("tcp://%s:%d", host, port));
  }

  private static class Addresses {
    Addresses(String bindTo, String advertise) {
      this.bindTo = bindTo;
      this.advertise = advertise;
    }

    String bindTo;
    String advertise;

    @Override
    public String toString() {
      return String.format("[binding to %s, advertising as %s]", bindTo, advertise);
    }
  }
}
