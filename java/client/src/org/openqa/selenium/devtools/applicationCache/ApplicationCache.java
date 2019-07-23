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

package org.openqa.selenium.devtools.applicationCache;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.applicationCache.model.ApplicationCacheModel;
import org.openqa.selenium.devtools.applicationCache.model.ApplicationCacheStatusUpdated;
import org.openqa.selenium.devtools.applicationCache.model.FrameWithManifest;
import org.openqa.selenium.devtools.page.model.FrameId;

import java.util.List;
import java.util.Objects;

public class ApplicationCache {

  /** Enables application cache domain notifications. */
  public static Command<Void> enable() {
    return new Command<>("ApplicationCache.enable", ImmutableMap.of());
  }

  /** Returns relevant application cache data for the document in given frame. */
  public static Command<ApplicationCacheModel> getApplicationCacheForFrame(FrameId frameId) {
    Objects.requireNonNull(frameId, "frameId is required");
    return new Command<>(
        "ApplicationCache.getApplicationCacheForFrame",
        ImmutableMap.of("frameId", frameId),
        map("applicationCache", ApplicationCacheModel.class));
  }

  /**
   * Returns array of frame identifiers with manifest urls for each frame containing a document
   * associated with some application cache.
   */
  public static Command<List<FrameWithManifest>> getFramesWithManifests() {
    return new Command<>(
        "ApplicationCache.getFramesWithManifests",
        ImmutableMap.of(),
        map("frameIds", new TypeToken<List<FrameWithManifest>>() {}.getType()));
  }

  public static Command<String> getManifestForFrame(FrameId frameId) {
    Objects.requireNonNull(frameId, "frameId is required");
    return new Command<>(
        "ApplicationCache.getManifestForFrame",
        ImmutableMap.of("frameId", frameId),
        map("manifestURL", String.class));
  }

  public static Event<ApplicationCacheStatusUpdated> applicationCacheStatusUpdated() {
    return new Event<>(
        "ApplicationCache.applicationCacheStatusUpdated",
        map("frameId", ApplicationCacheStatusUpdated.class));
  }

  public static Event<Boolean> networkStateUpdated() {
    return new Event<>("ApplicationCache.networkStateUpdated", map("isNowOnline", Boolean.class));
  }
}
