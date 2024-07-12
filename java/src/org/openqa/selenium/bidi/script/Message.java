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
package org.openqa.selenium.bidi.script;

import org.openqa.selenium.json.JsonInput;

public class Message {
  private final String channel;
  private final RemoteValue data;
  private final Source source;

  public Message(String channel, RemoteValue data, Source source) {
    this.channel = channel;
    this.data = data;
    this.source = source;
  }

  public static Message fromJson(JsonInput input) {
    String channel = null;
    RemoteValue data = null;
    Source source = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "channel":
          channel = input.read(String.class);
          break;

        case "data":
          data = input.read(RemoteValue.class);
          break;

        case "source":
          source = input.read(Source.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new Message(channel, data, source);
  }

  public String getChannel() {
    return channel;
  }

  public RemoteValue getData() {
    return data;
  }

  public Source getSource() {
    return source;
  }
}
