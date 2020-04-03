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

package org.openqa.selenium.grid.data;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

public class NodeStatusTest {

  @Test
  public void ensureRoundTripWorks() throws URISyntaxException {
    ImmutableCapabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    NodeStatus status = new NodeStatus(
        UUID.randomUUID(),
        new URI("http://localhost:23456"),
        100,
        ImmutableMap.of(stereotype, 1),
        ImmutableSet.of(new NodeStatus.Active(stereotype, new SessionId(UUID.randomUUID()), new ImmutableCapabilities("peas", "sausages"))),
        "cheese");

    Json json = new Json();
    String source = json.toJson(status);

    System.out.println(source);

    Object seen = json.toType(source, NodeStatus.class);

    assertThat(seen).isEqualTo(status);
  }

}
