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

package org.openqa.selenium.bidi.browsingcontext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.bidi.script.SerializationOptions;

public class LocateNodeParameters {

  private final Locator locator;
  private Optional<Long> maxNodeCount = Optional.empty();
  private Optional<ResultOwnership> ownership = Optional.empty();
  private Optional<String> sandbox = Optional.empty();
  private Optional<SerializationOptions> serializationOptions = Optional.empty();
  private Optional<List<RemoteReference>> startNodes = Optional.empty();

  private LocateNodeParameters(Builder builder) {
    this.locator = builder.locator;
    this.maxNodeCount = Optional.ofNullable(builder.maxNodeCount);
    this.sandbox = Optional.ofNullable(builder.sandbox);
    this.serializationOptions = Optional.ofNullable(builder.serializationOptions);
    this.startNodes = Optional.ofNullable(builder.startNodes);
  }

  public LocateNodeParameters(Locator locator) {
    this.locator = locator;
  }

  public LocateNodeParameters setMaxNodeCount(long maxNodeCount) {
    this.maxNodeCount = Optional.of(maxNodeCount);
    return this;
  }

  public LocateNodeParameters setSandbox(String sandbox) {
    this.sandbox = Optional.of(sandbox);
    return this;
  }

  public LocateNodeParameters setSerializationOptions(SerializationOptions options) {
    this.serializationOptions = Optional.of(options);
    return this;
  }

  public LocateNodeParameters setStartNodes(List<RemoteReference> startNodes) {
    this.startNodes = Optional.of(startNodes);
    return this;
  }

  public Map<String, Object> toMap() {
    final Map<String, Object> map = new HashMap<>();

    map.put("locator", locator.toMap());
    maxNodeCount.ifPresent(value -> map.put("maxNodeCount", value));
    sandbox.ifPresent(value -> map.put("sandbox", value));
    serializationOptions.ifPresent(value -> map.put("serializationOptions", value.toJson()));
    startNodes.ifPresent(
        value -> {
          List<Map<String, Object>> startNodesJson = new ArrayList<>();
          value.forEach(remoteNode -> startNodesJson.add(remoteNode.toJson()));
          map.put("startNodes", startNodesJson);
        });

    return map;
  }

  /**
   * @deprecated Use the chaining of LocateNodeParameters methods to add optional parameters. This
   *     is in favor of keeping the usage pattern consistent for BiDi parameters. Use the {@link
   *     LocateNodeParameters#LocateNodeParameters(Locator locator)} constructor and chain methods.
   */
  @Deprecated(since = "4.20", forRemoval = true)
  public static class Builder {

    private final Locator locator;
    private Long maxNodeCount = null;
    private String sandbox;
    private SerializationOptions serializationOptions;
    private List<RemoteReference> startNodes;

    public Builder(Locator locator) {
      this.locator = locator;
    }

    public Builder setMaxNodeCount(long maxNodeCount) {
      this.maxNodeCount = maxNodeCount;
      return this;
    }

    public Builder setSandbox(String sandbox) {
      this.sandbox = sandbox;
      return this;
    }

    public Builder setSerializationOptions(SerializationOptions options) {
      this.serializationOptions = options;
      return this;
    }

    public Builder setStartNodes(List<RemoteReference> startNodes) {
      this.startNodes = startNodes;
      return this;
    }

    public LocateNodeParameters build() {
      return new LocateNodeParameters(this);
    }
  }
}
