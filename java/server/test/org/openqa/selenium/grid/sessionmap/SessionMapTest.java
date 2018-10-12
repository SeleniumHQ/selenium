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

package org.openqa.selenium.grid.sessionmap;

import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.grid.web.PassthroughHttpClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

/**
 * We test the session map by ensuring that the HTTP protocol is properly adhered to. If this is
 * true, then any implementations are interoperable, and we can breathe a sigh of relief.
 */
public class SessionMapTest {

  private SessionId id;
  private Session expected;
  private SessionMap local;
  private HttpClient client;
  private SessionMap remote;

  @Before
  public void setUp() throws URISyntaxException {
    id = new SessionId(UUID.randomUUID());
    expected = new Session(
        id,
        new URI("http://localhost:1234"),
        new ImmutableCapabilities());

    local = new LocalSessionMap();
    client = new PassthroughHttpClient<>(local);
    remote = new RemoteSessionMap(client);
  }

  @Test
  public void shouldBeAbleToAddASession() {
    assertTrue(remote.add(expected));

    assertEquals(expected, local.get(id));
  }

  @Test
  public void shouldBeAbleToRetrieveASessionUri() {
    local.add(expected);

    assertEquals(expected, remote.get(id));
  }

  @Test
  public void shouldThrowANoSuchSessionExceptionIfSessionCannotBeFound() {
    catchThrowableOfType(() -> local.get(id), NoSuchSessionException.class);
    catchThrowableOfType(() -> remote.get(id), NoSuchSessionException.class);
  }

  @Test
  public void shouldAllowSessionsToBeRemoved() {
    local.add(expected);

    assertEquals(expected, remote.get(id));

    remote.remove(id);

    catchThrowableOfType(() -> local.get(id), NoSuchSessionException.class);
    catchThrowableOfType(() -> remote.get(id), NoSuchSessionException.class);
  }

  /**
   * This is because multiple areas within the grid may all try and remove a session.
   */
  @Test
  public void removingASessionThatDoesNotExistIsNotAnError() {
    remote.remove(id);
  }

  @Test(expected = NoSuchSessionException.class)
  public void shouldThrowAnExceptionIfGettingASessionThatDoesNotExist() {
    remote.get(id);
  }

}
