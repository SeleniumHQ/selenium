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
import static org.openqa.selenium.grid.data.Availability.UP;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;

class NodeStatusTest {

  @Test
  void ensureRoundTripWorks() throws URISyntaxException {
    ImmutableCapabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    NodeId nodeId = new NodeId(UUID.randomUUID());
    NodeStatus status =
        new NodeStatus(
            nodeId,
            new URI("http://localhost:23456"),
            100,
            ImmutableSet.of(
                new Slot(
                    new SlotId(nodeId, UUID.randomUUID()),
                    stereotype,
                    Instant.EPOCH,
                    new Session(
                        new SessionId(UUID.randomUUID()),
                        new URI("http://localhost:1235"),
                        stereotype,
                        new ImmutableCapabilities("peas", "sausages"),
                        Instant.now()))),
            UP,
            Duration.ofSeconds(10),
            Duration.ofSeconds(300),
            "4.0.0",
            ImmutableMap.of(
                "name", "Max OS X",
                "arch", "x86_64",
                "version", "10.15.7"));

    Json json = new Json();
    String source = json.toJson(status);

    System.out.println(source);

    Object seen = json.toType(source, NodeStatus.class);

    assertThat(seen).isEqualTo(status);
  }

  @Test
  void withoutSessionTimeoutInJsonStatus() throws URISyntaxException {
    String source =
        "{\n"
            + "      \"availability\": \"UP\",\n"
            + "      \"externalUri\": \"http:\\u002f\\u002f192.168.1.101:5555\",\n"
            + "      \"heartbeatPeriod\": 60000,\n"
            + "      \"maxSessions\": 1,\n"
            + "      \"nodeId\": \"d136dd9b-6497-4049-9371-42f89b14ea2b\",\n"
            + "      \"osInfo\": {\n"
            + "        \"arch\": \"aarch64\",\n"
            + "        \"name\": \"Mac OS X\",\n"
            + "        \"version\": \"15.3\"\n"
            + "      },\n"
            + "      \"slots\": [\n"
            + "        {\n"
            + "          \"id\": {\n"
            + "            \"hostId\": \"d136dd9b-6497-4049-9371-42f89b14ea2b\",\n"
            + "            \"id\": \"965e8cb4-7b48-4638-8bc8-6889c6319682\"\n"
            + "          },\n"
            + "          \"lastStarted\": \"1970-01-01T00:00:00Z\",\n"
            + "          \"session\": null,\n"
            + "          \"stereotype\": {\n"
            + "            \"browserName\": \"chrome\",\n"
            + "            \"platformName\": \"mac\"\n"
            + "          }\n"
            + "        }\n"
            + "      ],\n"
            + "      \"version\": \"4.17.0 (revision unknown*)\"\n"
            + "    }";

    Json json = new Json();
    NodeStatus nodeStatus = json.toType(source, NodeStatus.class);

    assertThat(nodeStatus.getSessionTimeout()).isEqualTo(Duration.ofSeconds(300));
  }

  @Test
  void withSessionTimeoutInJsonStatus() throws URISyntaxException {
    String source =
        "{\n"
            + "      \"availability\": \"UP\",\n"
            + "      \"externalUri\": \"http:\\u002f\\u002f192.168.1.101:5555\",\n"
            + "      \"heartbeatPeriod\": 60000,\n"
            + "      \"maxSessions\": 1,\n"
            + "      \"sessionTimeout\": 600000,\n"
            + "      \"nodeId\": \"d136dd9b-6497-4049-9371-42f89b14ea2b\",\n"
            + "      \"osInfo\": {\n"
            + "        \"arch\": \"aarch64\",\n"
            + "        \"name\": \"Mac OS X\",\n"
            + "        \"version\": \"15.3\"\n"
            + "      },\n"
            + "      \"slots\": [\n"
            + "        {\n"
            + "          \"id\": {\n"
            + "            \"hostId\": \"d136dd9b-6497-4049-9371-42f89b14ea2b\",\n"
            + "            \"id\": \"965e8cb4-7b48-4638-8bc8-6889c6319682\"\n"
            + "          },\n"
            + "          \"lastStarted\": \"1970-01-01T00:00:00Z\",\n"
            + "          \"session\": null,\n"
            + "          \"stereotype\": {\n"
            + "            \"browserName\": \"chrome\",\n"
            + "            \"platformName\": \"mac\"\n"
            + "          }\n"
            + "        }\n"
            + "      ],\n"
            + "      \"version\": \"4.17.0 (revision unknown*)\"\n"
            + "    }";

    Json json = new Json();
    NodeStatus nodeStatus = json.toType(source, NodeStatus.class);

    assertThat(nodeStatus.getSessionTimeout()).isEqualTo(Duration.ofSeconds(600));
  }
}
