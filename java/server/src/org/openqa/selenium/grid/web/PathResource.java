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

package org.openqa.selenium.grid.web;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static com.google.common.collect.ImmutableSet.toImmutableSet;

public class PathResource implements Resource {

  private final Path base;

  public PathResource(Path base) {
    this.base = Objects.requireNonNull(base).normalize();
  }

  @Override
  public String name() {
    return base.getFileName().toString();
  }

  @Override
  public Optional<Resource> get(String path) {
    // Paths are expected to start with a leading slash. Strip it, if present
    if (path.startsWith("/")) {
      path = path.length() == 1 ? "" : path.substring(1);
    }

    Path normalized = base.resolve(path).normalize();
    if (!normalized.startsWith(base)) {
      throw new RuntimeException("Attempt to navigate away from the parent directory");
    }

    if (Files.exists(normalized)) {
      return Optional.of(new PathResource(normalized));
    }

    return Optional.empty();
  }

  @Override
  public boolean isDirectory() {
    return Files.isDirectory(base);
  }

  @Override
  public Set<Resource> list() {
    try {
      return Files.list(base).map(PathResource::new).collect(toImmutableSet());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public Optional<byte[]> read() {
    if (!Files.exists(base)) {
      return Optional.empty();
    }

    try {
      return Optional.of(Files.readAllBytes(base));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
