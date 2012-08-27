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

import static com.google.common.base.Preconditions.checkState;

import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.handler.codec.http.websocketx.TextWebSocketFrame;

/**
 * A basic WebSocket client connection.
 */
class WebSocketConnection {

  private final Channel channel;

  public WebSocketConnection(Channel channel) {
    this.channel = channel;
  }

  private void checkChannel() {
    checkState(channel.isOpen() && channel.isConnected(),
        "The WebSocket connection has been closed");
  }

  /**
   * Sends a text frame.
   *
   * @param data The frame data.
   */
  public void send(String data) {
    checkChannel();
    TextWebSocketFrame frame = new TextWebSocketFrame(data);
    channel.write(frame);
  }

  /**
   * Closes this connection.
   */
  public void close() {
    channel.close().addListener(ChannelFutureListener.CLOSE);
  }
}
