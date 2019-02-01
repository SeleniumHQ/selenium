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
import org.openqa.selenium.net.PortProber;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;
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

  BoundZmqEventBus(ZContext context, String connection) {
    LOG.info("Binding event bus to " + connection);
    ZMQ.Socket rep = context.createSocket(ZMQ.REP);
    rep.bind(connection);

    xpub = context.createSocket(ZMQ.XPUB);
    xsub = context.createSocket(ZMQ.XSUB);

    String address = new NetworkUtils().getHostAddress();
    Addresses xpubAddr = deriveAddresses(address, connection);
    Addresses xsubAddr = deriveAddresses(address, connection);

    LOG.info(String.format("XPUB binding to %s, XSUB binding to %s", xpubAddr, xsubAddr));

    xpub.bind(xpubAddr.bindTo);
    xsub.bind(xsubAddr.bindTo);

    executor = Executors.newFixedThreadPool(2, r -> {
      Thread thread = new Thread(r, "Message Bus Proxy");
      thread.setDaemon(true);
      return thread;
    });
    executor.submit(() -> ZMQ.proxy(xsub, xpub, null));

    executor.submit(() -> {
      while (!Thread.currentThread().isInterrupted()) {
        rep.recvStr();
        rep.sendMore(xpubAddr.advertise);
        rep.send(xsubAddr.advertise);
      }
    });

    delegate = new UnboundZmqEventBus(context, connection);
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
      String address = String.format(
          "%s-%s",
          connection,
          Long.toHexString(UUID.randomUUID().getMostSignificantBits()).substring(0, 8));
      return new Addresses(address, address);
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

    if (!"*".equals(hostName)) {
      host = hostName;
    }

    int port = PortProber.findFreePort();
    return new Addresses(
        String.format("tcp://%s:%d", hostName, port),
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
      return advertise;
    }
  }
}
