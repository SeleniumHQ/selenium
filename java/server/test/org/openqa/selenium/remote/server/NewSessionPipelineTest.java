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

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.grid.selenium.node.FirefoxMutator;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.NewSessionPayload;

import java.io.IOException;
import java.util.Optional;

public class NewSessionPipelineTest {

  @Test
  public void shouldCallSessionFactory() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    SessionFactory fallback = mock(SessionFactory.class);
    ActiveSession session = mock(ActiveSession.class);
    when(factory.apply(any(), any())).thenReturn(Optional.of(session));

    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory).fallback(fallback).create();

    pipeline.createNewSession(NewSessionPayload.create(caps));
    verify(factory).apply(any(), argThat(cap -> cap.getCapability("browserName").equals("firefox")));
    verifyZeroInteractions(fallback);
  }

  @Test
  public void shouldBeAbleToFallBack() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    SessionFactory fallback = mock(SessionFactory.class);
    ActiveSession session = mock(ActiveSession.class);
    when(factory.apply(any(), any())).thenReturn(Optional.empty());
    when(fallback.apply(any(), any())).thenReturn(Optional.of(session));

    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory).fallback(fallback).create();

    pipeline.createNewSession(NewSessionPayload.create(caps));
    verify(fallback).apply(any(), argThat(cap -> cap.asMap().size() == 0));
  }

  @Test
  public void shouldUseMutators() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    ActiveSession session = mock(ActiveSession.class);
    when(factory.apply(any(), any())).thenReturn(Optional.of(session));
    FirefoxMutator mutator = new FirefoxMutator(new ImmutableCapabilities(
        "browserName", "firefox",
        "marionette", true
    ));

    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "firefox")));

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory).addCapabilitiesMutator(mutator).create();

    pipeline.createNewSession(NewSessionPayload.create(caps));
    verify(factory).apply(any(), argThat(cap -> cap.getCapability("marionette").equals(true)));
  }
}
