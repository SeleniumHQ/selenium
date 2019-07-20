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

package org.openqa.selenium.devtools.profiler.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Recorded profile.
 */
public class Profile {

  /**
   * The list of profile nodes. First item is the root node.
   */
  private final List<ProfileNode> nodes;
  /**
   * Profiling start timestamp in microseconds.
   */
  private final Instant startTime;
  /**
   * Profiling end timestamp in microseconds.
   */
  private final Instant endTime;
  /**
   * Ids of samples top nodes. Optional
   */
  private final List<Integer> samples;
  /**
   * Time intervals between adjacent samples in microseconds. The first delta is relative to the. profile startTime.
   * Optional
   */
  private final List<Integer> timeDeltas;

  public Profile(List<ProfileNode> nodes, Instant startTime, Instant endTime,
                 List<Integer> samples, List<Integer> timeDeltas) {
    validateNodes(nodes);
    Objects.requireNonNull(startTime, "startTime is require for Profile object");
    Objects.requireNonNull(endTime, "endTime is require for Profile object");

    this.nodes = nodes;
    this.startTime = startTime;
    this.endTime = endTime;
    this.samples = samples;
    this.timeDeltas = timeDeltas;
  }

  public List<ProfileNode> getNodes() {
    return nodes;
  }

  private static Profile fromJson(JsonInput input) {
    List<ProfileNode> nodes = null;
    Instant startTime = null;
    Instant endTime = null;
    List<Integer> samples = null;
    List<Integer> timeDeltas = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "nodes":
          nodes = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            nodes.add(ProfileNode.fromJson(input));
          }
          input.endArray();
          break;
        case "startTime":
          startTime = input.nextInstant();
          break;
        case "endTime":
          endTime = input.nextInstant();
          break;
        case "samples":
          samples = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            samples.add(input.read(Integer.class));
          }
          input.endArray();
          break;
        case "timeDeltas":
          timeDeltas = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            timeDeltas.add(input.read(Integer.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new Profile(nodes, startTime, endTime, samples, timeDeltas);
  }

  private void validateNodes(List<ProfileNode> nodes) {
    Objects.requireNonNull(nodes, "nodes are require for Profile object");
    if (nodes.isEmpty()) {
      throw new DevToolsException("Nodes cannot be Empty Object");
    }
  }

  public Instant getStartTime() {
    return startTime;
  }


  public Instant getEndTime() {
    return endTime;
  }


  public List<Integer> getSamples() {
    return samples;
  }

  public List<Integer> getTimeDeltas() {
    return timeDeltas;
  }


}
