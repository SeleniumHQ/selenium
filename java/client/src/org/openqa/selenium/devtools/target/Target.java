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
package org.openqa.selenium.devtools.target;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.ConverterFunctions;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.target.model.AttachToTarget;
import org.openqa.selenium.devtools.target.model.BrowserContextID;
import org.openqa.selenium.devtools.target.model.DetachedFromTarget;
import org.openqa.selenium.devtools.target.model.ReceivedMessageFromTarget;
import org.openqa.selenium.devtools.target.model.RemoteLocation;
import org.openqa.selenium.devtools.target.model.SessionId;
import org.openqa.selenium.devtools.target.model.TargetCrashed;
import org.openqa.selenium.devtools.target.model.TargetId;
import org.openqa.selenium.devtools.target.model.TargetInfo;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class Target {

  /**
   * Activates (focuses) the target.
   */
  public static Command<Void> activateTarget(TargetId targetId) {
    Objects.requireNonNull(targetId, "Target ID must be set.");
    return new Command<>("Target.activateTarget", ImmutableMap.of("targetId", targetId));
  }

  /**
   * Attaches to the browser target, only uses flat sessionId mode.EXPERIMENTAL
   *
   * @return {@link SessionId}
   */
  @Beta
  public static Command<SessionId> attachToBrowserTarget() {
    return new Command<>(
        "Target.attachToBrowserTarget",
        ImmutableMap.of(),
        ConverterFunctions.map("sessionId", SessionId.class));
  }

  /**
   * Closes the target. If the target is a page that gets closed too.
   */
  public static Command<Boolean> closeTarget(TargetId targetId) {
    Objects.requireNonNull(targetId, "Target ID must be set.");
    return new Command<>(
        "Target.closeTarget",
        ImmutableMap.of("targetId", targetId),
        ConverterFunctions.map("success", Boolean.class));
  }

  /**
   * nject object to the target's main frame that provides a communication channel with browser
   * target. Injected object will be available as window[bindingName]. The object has the follwing
   * API: binding.send(json) - a method to send messages over the remote debugging protocol
   * binding.onmessage = json =&gt; handleMessage(json) - a callback that will be called for the
   * protocol notifications and command responses.
   */
  @Beta
  public static Command<Void> exposeDevToolsProtocol(
      TargetId targetId, Optional<String> bindingName) {
    Objects.requireNonNull(targetId, "Target ID must be set.");
    String bindingNameValue = (bindingName.isPresent()) ? bindingName.get() : "cdp";
    return new Command<>(
        "Target.exposeDevToolsProtocol",
        ImmutableMap.of("targetId", targetId, "bindingName", bindingNameValue));
  }

  /**
   * Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than
   * one.EXPERIMENTAL
   */
  @Beta
  public static Command<BrowserContextID> createBrowserContext() {
    return new Command<>(
        "Target.createBrowserContext",
        ImmutableMap.of(),
        ConverterFunctions.map("browserContextId", BrowserContextID.class));
  }

  /**
   * Returns all browser contexts created with Target.createBrowserContext method.EXPERIMENTAL
   */
  @Beta
  public static Command<List<BrowserContextID>> getBrowserContexts() {
    return new Command<>(
        "Target.getBrowserContexts",
        ImmutableMap.of(),
        ConverterFunctions.map(
            "browserContextIds", new TypeToken<List<BrowserContextID>>() {
            }.getType()));
  }

  /**
   * Creates a new page.
   */
  public static Command<TargetId> createTarget(
      String url,
      Optional<Integer> width,
      Optional<Integer> height,
      Optional<BrowserContextID> browserContextID,
      Optional<Boolean> enableBeginFrameControl,
      Optional<Boolean> newWindow,
      Optional<Boolean> background) {
    Objects.requireNonNull(url, "Url is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("url", url);
    width.ifPresent(integer -> params.put("width", integer));
    height.ifPresent(integer -> params.put("height", integer));
    browserContextID.ifPresent(
        browserContextId -> params.put("browserContextId", browserContextId));
    enableBeginFrameControl.ifPresent(aBoolean -> params.put("enableBeginFrameControl", aBoolean));
    newWindow.ifPresent(aBoolean -> params.put("newWindow", aBoolean));
    background.ifPresent(aBoolean -> params.put("background", aBoolean));
    return new Command<>(
        "Target.createTarget", params.build(), ConverterFunctions.map("targetId", TargetId.class));
  }

  /**
   * Detaches session with given id.
   */
  public static Command<Void> detachFromTarget(
      Optional<SessionId> sessionId, Optional<TargetId> targetId) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    sessionId.ifPresent(sessionID -> params.put("sessionId", sessionID));
    targetId.ifPresent(targetID -> params.put("targetId", targetID));
    return new Command<>("Target.detachFromTarget", params.build());
  }

  /**
   * Deletes a BrowserContext. All the belonging pages will be closed without calling their
   * beforeunload hooks.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> disposeBrowserContext(BrowserContextID browserContextID) {
    Objects.requireNonNull(browserContextID, "browserContextId is required");
    return new Command<>(
        "Target.disposeBrowserContext", ImmutableMap.of("browserContextId", browserContextID));
  }

  /**
   * Returns information about a target.EXPERIMENTAL
   */
  @Beta
  public static Command<TargetInfo> getTargetInfo(Optional<TargetId> targetId) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    targetId.ifPresent(targetID -> params.put("targetId", targetID));
    return new Command<>(
        "Target.getTargetInfo",
        params.build(),
        ConverterFunctions.map("targetInfo", TargetInfo.class));
  }

  /**
   * Retrieves a list of available targets.
   */
  public static Command<List<TargetInfo>> getTargets() {
    return new Command<>(
        "Target.getTargets",
        ImmutableMap.of(),
        ConverterFunctions.map("targetInfos", new TypeToken<List<TargetInfo>>() {
        }.getType()));
  }

  /**
   * Controls whether to discover available targets and notify via
   * targetCreated/targetInfoChanged/targetDestroyed events.
   */
  public static Command<Void> sendMessageToTarget(
      String message, Optional<SessionId> sessionID, @Deprecated Optional<TargetId> targetID) {
    Objects.requireNonNull(message, "message is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("message", message);
    sessionID.ifPresent(sessionId -> params.put("sessionId", sessionId));
    targetID.ifPresent(targetId -> params.put("targetId", targetId));
    return new Command<>("Target.sendMessageToTarget", params.build());
  }

  /**
   * Attaches to the target with given id.
   *
   * @return {@link SessionId}
   */
  public static Command<SessionId> attachToTarget(TargetId targetId, Optional<Boolean> flatten) {
    Objects.requireNonNull(targetId, "Target ID must be set.");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("targetId", targetId);
    params.put("flatten", flatten.orElse(true));
//    flatten.ifPresent(aBoolean -> params.put("flatten", aBoolean));
    return new Command<>(
        "Target.attachToTarget",
        params.build(),
        ConverterFunctions.map("sessionId", SessionId.class));
  }

  /**
   * Controls whether to automatically attach to new targets which are considered to be related to
   * this one. When turned on, attaches to all existing related targets as well. When turned off,
   * automatically detaches from all currently attached targets.EXPERIMENTAL
   */
  public static Command<Void> setAutoAttach(
      Boolean autoAttach, Boolean waitForDebuggerOnStart, Optional<Boolean> flatten) {
    Objects.requireNonNull(autoAttach, "autoAttach is required");
    Objects.requireNonNull(waitForDebuggerOnStart, "waitForDebuggerOnStart is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("autoAttach", autoAttach);
    params.put("waitForDebuggerOnStart", waitForDebuggerOnStart);
    flatten.ifPresent(aBoolean -> params.put("flatten", aBoolean));
    return new Command<>("Target.setAutoAttach", params.build());
  }

  /**
   * Controls whether to discover available targets and notify via
   * targetCreated/targetInfoChanged/targetDestroyed events.
   */
  public static Command<Void> setDiscoverTargets(boolean discover) {
    return new Command(
        "Target.setDiscoverTargets",
        ImmutableMap.of("discover", discover));
  }

  /**
   * Enables target discovery for the specified locations, when setDiscoverTargets was set to
   * true.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> setRemoteLocations(List<RemoteLocation> locations) {
    return new Command(
        "Target.setRemoteLocations",
        ImmutableMap.of("locations", locations));
  }

  /**
   * Issued when attached to target because of auto-attach or attachToTarget command.EXPERIMENTAL
   */
  @Beta
  public static Event<AttachToTarget> attachedToTarget() {
    return new Event<>("Target.attachedToTarget", map("sessionId", AttachToTarget.class));
  }

  /**
   * Issued when detached from target for any reason (including detachFromTarget command). Can be
   * issued multiple times per target if multiple sessions have been attached to it.EXPERIMENTAL
   */
  @Beta
  public static Event<DetachedFromTarget> detachedFromTarget() {
    return new Event<>("Target.detachedFromTarget", map("sessionId", DetachedFromTarget.class));
  }

  /**
   * Notifies about a new protocol message received from the session (as reported in
   * attachedToTarget event).
   */
  public static Event<ReceivedMessageFromTarget> receivedMessageFromTarget() {
    return new Event<>(
        "Target.receivedMessageFromTarget", map("sessionId", ReceivedMessageFromTarget.class));
  }

  /**
   * Issued when a possible inspection target is created.
   */
  public static Event<TargetInfo> targetCreated() {
    return new Event<>("Target.targetDestroyed", map("targetInfo", TargetInfo.class));
  }

  /**
   * Issued when a target is destroyed.
   */
  public static Event<TargetId> targetDestroyed() {
    return new Event<>("Target.targetDestroyed", map("targetId", TargetId.class));
  }

  /**
   * Issued when a target has crashed.
   */
  public static Event<TargetCrashed> targetCrashed() {
    return new Event<>("Target.targetCrashed", map("targetId", TargetCrashed.class));
  }

  /**
   * Issued when some information about a target has changed. This only happens between
   * targetCreated and targetDestroyed.
   */
  public static Event<TargetInfo> targetInfoChanged() {
    return new Event<>("Target.targetInfoChanged", map("targetInfo", TargetInfo.class));
  }
}
