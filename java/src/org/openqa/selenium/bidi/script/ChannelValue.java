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

import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;

public class ChannelValue extends LocalValue {

  private final String channelId;
  private SerializationOptions options;

  private ResultOwnership resultOwnership;

  public ChannelValue(String channelId) {
    this.channelId = channelId;
  }

  public ChannelValue(String channelId, SerializationOptions options) {
    this.channelId = channelId;
    this.options = options;
  }

  public ChannelValue(String channelId, ResultOwnership resultOwnership) {
    this.channelId = channelId;
    this.resultOwnership = resultOwnership;
  }

  ChannelValue(String channelId, SerializationOptions options, ResultOwnership resultOwnership) {
    this.channelId = channelId;
    this.options = options;
    this.resultOwnership = resultOwnership;
  }

  @Override
  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    Map<String, Object> channelProperties = new TreeMap<>();

    channelProperties.put("channel", channelId);

    if (options != null) {
      channelProperties.put("serializationOptions", options);
    }

    if (resultOwnership != null) {
      channelProperties.put("ownership", resultOwnership);
    }

    toReturn.put("type", "channel");
    toReturn.put("value", channelProperties);

    return Collections.unmodifiableMap(toReturn);
  }
}
