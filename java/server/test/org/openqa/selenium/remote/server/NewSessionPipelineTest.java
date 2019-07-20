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

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.session.SessionFactory;
import org.openqa.selenium.remote.NewSessionPayload;

import java.util.Optional;

public class NewSessionPipelineTest {

  @Test
  public void shouldCallSessionFactory() {
    SessionFactory factory = mock(SessionFactory.class);
    when(factory.test(any())).thenReturn(true);
    SessionFactory fallback = mock(SessionFactory.class);
    when(fallback.test(any())).thenReturn(true);
    ActiveSession session = mock(ActiveSession.class);
    when(factory.apply(any())).thenReturn(Optional.of(session));

    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory).fallback(fallback).create();

    pipeline.createNewSession(NewSessionPayload.create(caps));
    verify(factory).apply(argThat(req -> req.getCapabilities().getCapability("browserName").equals("firefox")));
    verifyZeroInteractions(fallback);
  }

  @Test
  public void shouldBeAbleToFallBack() {
    SessionFactory factory = mock(SessionFactory.class);
    SessionFactory fallback = mock(SessionFactory.class);
    ActiveSession session = mock(ActiveSession.class);
    when(factory.apply(any())).thenReturn(Optional.empty());
    when(fallback.apply(any())).thenReturn(Optional.of(session));

    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory).fallback(fallback).create();

    pipeline.createNewSession(NewSessionPayload.create(caps));
    verify(fallback).apply(argThat(req -> req.getCapabilities().getCapabilityNames().size() == 0));
  }

  @Test
  @Ignore("Add back test to ensure we use mutators properly")
  public void shouldUseMutators() {
//    SessionFactory factory = mock(SessionFactory.class);
//    when(factory.test(any())).thenReturn(true);
//    ActiveSession session = mock(ActiveSession.class);
//    when(factory.apply(any())).thenReturn(Optional.of(session));
//    FirefoxMutator mutator = new FirefoxMutator(new ImmutableCapabilities(
//        "browserName", "firefox",
//        "marionette", true
//    ));
//
//    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
//        "capabilities", ImmutableMap.of(
//            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));
//
//    NewSessionPipeline pipeline = NewSessionPipeline.builder()
//        .add(factory)
//        .addCapabilitiesMutator(mutator)
//        .create();
//
//    pipeline.createNewSession(NewSessionPayload.create(caps));
//    verify(factory).apply(argThat(req -> req.getCapabilities().getCapability("marionette").equals(true)));
  }

  @Test
  public void shouldNotUseFactoriesThatDoNotSupportTheCapabilities() {
    SessionFactory toBeIgnored = mock(SessionFactory.class);
    when(toBeIgnored.test(any())).thenReturn(false);
    when(toBeIgnored.apply(any())).thenThrow(new AssertionError("Must not be called"));

    ActiveSession session = mock(ActiveSession.class);
    SessionFactory toBeUsed = mock(SessionFactory.class);
    when(toBeUsed.test(any())).thenReturn(true);
    when(toBeUsed.apply(any())).thenReturn(Optional.of(session));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(toBeIgnored)
        .add(toBeUsed)
        .create();

    ActiveSession seen =
        pipeline.createNewSession(NewSessionPayload.create(new ImmutableCapabilities()));

    assertEquals(session, seen);
    verify(toBeIgnored, atLeast(1)).test(any());
  }
}
