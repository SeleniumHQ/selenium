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

package org.openqa.selenium.remote.http;

import static java.util.logging.Level.WARNING;

import java.io.Closeable;
import java.util.function.Consumer;
import java.util.logging.Logger;

public interface WebSocket extends Closeable {
  Logger LOG = Logger.getLogger(WebSocket.class.getName());

  WebSocket send(Message message);

  default WebSocket sendText(CharSequence data) {
    return send(new TextMessage(data));
  }

  default WebSocket sendBinary(byte[] data) {
    return send(new BinaryMessage(data));
  }

  @Override
  void close();

  interface Listener extends Consumer<Message> {

    default void accept(Message message) {
      if (message instanceof BinaryMessage) {
        onBinary(((BinaryMessage) message).data());
      } else if (message instanceof CloseMessage) {
        onClose(((CloseMessage) message).code(), ((CloseMessage) message).reason());
      } else if (message instanceof TextMessage) {
        onText(((TextMessage) message).text());
      }
    }

    default void onBinary(byte[] data) {
      // Does nothing
    }

    default void onClose(int code, String reason) {
      // Does nothing
    }

    default void onText(CharSequence data) {
      // Does nothing
    }

    default void onError(Throwable cause) {
      LOG.log(WARNING, cause.getMessage(), cause);
    }
  }
}
