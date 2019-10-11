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
package org.openqa.selenium.devtools.applicationCache.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Detailed application cache information. */
public class ApplicationCacheModel {
  /** Manifest URL. */
  private final String manifestURL;
  /** Application cache size. */
  private final double size;
  /** Application cache creation time. */
  private final double creationTime;
  /** Application cache update time. */
  private final double updateTime;
  /** Application cache resources. */
  private final List<ApplicationCacheResource> resources;

  public ApplicationCacheModel(
      String manifestURL,
      double size,
      double creationTime,
      double updateTime,
      List<ApplicationCacheResource> resources) {
    this.manifestURL = Objects.requireNonNull(manifestURL, "manifestURL is required");
    this.size = Objects.requireNonNull(size, "size is required");
    this.creationTime = Objects.requireNonNull(creationTime, "creationTime is required");
    this.updateTime = Objects.requireNonNull(updateTime, "updateTime is required");
    this.resources = validateResources(resources);
  }

  private static ApplicationCacheModel fromJson(JsonInput input) {
    String manifestURL = input.nextString();
    Double size = null, creationTime = null, updateTime = null;
    List<ApplicationCacheResource> resources = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "size":
          size = input.read(Double.class);
          break;
        case "creationTime":
          creationTime = input.read(Double.class);
          break;
        case "updateTime":
          updateTime = input.read(Double.class);
          break;
        case "resources":
          resources = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            resources.add(input.read(ApplicationCacheResource.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ApplicationCacheModel(manifestURL, size, creationTime, updateTime, resources);
  }

  private List<ApplicationCacheResource> validateResources(List<ApplicationCacheResource> resources) {
    Objects.requireNonNull(resources, "resources is required");
    if (resources.isEmpty()) {
      throw new DevToolsException("resources is empty");
    }
    return resources;
  }

  public String getManifestURL() {
    return manifestURL;
  }

  public double getSize() {
    return size;
  }

  public double getCreationTime() {
    return creationTime;
  }

  public double getUpdateTime() {
    return updateTime;
  }

  public List<ApplicationCacheResource> getResources() {
    return resources;
  }
}
