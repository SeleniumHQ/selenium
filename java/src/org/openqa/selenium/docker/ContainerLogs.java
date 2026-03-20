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

package org.openqa.selenium.docker;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.stream.Collectors;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;

public class ContainerLogs {

  private final Contents.Supplier contents;
  private final ContainerId id;

  public ContainerLogs(ContainerId id, Contents.Supplier contents) {
    this.contents = Require.nonNull("Container logs", contents);
    this.id = Require.nonNull("Container id", id);
  }

  /**
   * @deprecated List of container logs might be very long. If you need to write down the logs, use
   *     {@link #getLogs()} to avoid reading the whole content to memory.
   */
  @Deprecated
  public List<String> getLogLines() {
    try (BufferedReader in = new BufferedReader(new InputStreamReader(contents.get(), UTF_8))) {
      return in.lines().collect(Collectors.toList());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public ContainerId getId() {
    return id;
  }

  @Override
  public String toString() {
    return String.format("ContainerInfo{id=%s,size=%s}", id, contents.length());
  }

  public InputStream getLogs() {
    return contents.get();
  }
}
