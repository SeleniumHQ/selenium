/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.collect.Maps;

import org.webbitserver.BaseWebSocketHandler;
import org.webbitserver.WebSocketConnection;

import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.logging.Logger;

class SafariDriverWebSocketHandler extends BaseWebSocketHandler {
  
  private static final Logger LOG = Logger.getLogger(
      SafariDriverWebSocketHandler.class.getName());

  private final BlockingQueue<SafariDriverConnection> connectionQueue;
  private final Map<WebSocketConnection, SafariDriverConnection> connections;

  public SafariDriverWebSocketHandler(BlockingQueue<SafariDriverConnection> connectionQueue) {
    this.connectionQueue = checkNotNull(connectionQueue);
    this.connections = Maps.newHashMap();
  }

  @Override
  public void onOpen(WebSocketConnection connection) throws Exception {
    LOG.info("Connection opened");

    SafariDriverConnection safariConnection = new SafariDriverConnection(connection);
    connectionQueue.put(safariConnection);
    connections.put(connection, safariConnection);
  }

  @Override
  public void onClose(WebSocketConnection connection) throws Exception {
    LOG.info("Connection closed");

    if (connections.remove(connection) == null) {
      LOG.warning("Closed unregistered connection");
    }
    // TODO: notify channel?
  }

  @Override
  public void onMessage(WebSocketConnection connection, String msg) throws Throwable {
    LOG.fine("Received message: " + msg);

    SafariDriverConnection safariConnection = connections.get(connection);
    if (safariConnection == null) {
      LOG.warning("Received message from unregistered connection");
    } else {
      safariConnection.onMessage(msg);
    }
  }
}
