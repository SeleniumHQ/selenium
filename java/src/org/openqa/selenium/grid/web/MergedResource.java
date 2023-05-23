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

import com.google.common.collect.ImmutableSet;
import java.util.Optional;
import java.util.Set;
import org.openqa.selenium.internal.Require;

public class MergedResource implements Resource {

  private final Resource base;
  private final Optional<Resource> next;

  public MergedResource(Resource base) {
    this(base, null);
  }

  private MergedResource(Resource base, Resource next) {
    this.base = Require.nonNull("Base resource", base);
    this.next = Optional.ofNullable(next);
  }

  public MergedResource alsoCheck(Resource resource) {
    return new MergedResource(this, Require.nonNull("Resource", resource));
  }

  @Override
  public String name() {
    return base.name();
  }

  @Override
  public Optional<Resource> get(String path) {
    Optional<Resource> resource = base.get(path);
    if (resource.isPresent()) {
      return resource;
    }

    if (!next.isPresent()) {
      return Optional.empty();
    }

    return next.get().get(path);
  }

  @Override
  public boolean isDirectory() {
    return base.isDirectory() || next.map(Resource::isDirectory).orElse(false);
  }

  @Override
  public Set<Resource> list() {
    ImmutableSet.Builder<Resource> resources = ImmutableSet.builder();
    resources.addAll(base.list());
    next.ifPresent(res -> resources.addAll(res.list()));
    return resources.build();
  }

  @Override
  public Optional<byte[]> read() {
    Optional<byte[]> data = base.read();
    if (data.isPresent()) {
      return data;
    }

    if (!next.isPresent()) {
      return Optional.empty();
    }

    return next.get().read();
  }
}
