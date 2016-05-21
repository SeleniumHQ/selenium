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

package org.openqa.grid.internal;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.grid.common.exception.GridException;

import java.util.HashMap;

public class ActiveTestSessionsTest {

  private final ActiveTestSessions activeTestSessions = new ActiveTestSessions();

  @Test
  public void testAdd() throws Exception {
    activeTestSessions.add(createTestSession());
    assertEquals(1, activeTestSessions.unmodifiableSet().size());
  }


  @Test
  public void testRemove() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    assertEquals(1, activeTestSessions.unmodifiableSet().size());
    activeTestSessions.remove(testSession, SessionTerminationReason.CLIENT_STOPPED_SESSION);
    assertEquals(0, activeTestSessions.unmodifiableSet().size());
  }

  @Test
  public void testRemoveWithoutExternalKey() throws Exception {
    TestSession testSession = createTestSession();
    testSession.setExternalKey(null);
    activeTestSessions.add(testSession);
    assertEquals(1, activeTestSessions.unmodifiableSet().size());
    activeTestSessions.remove(testSession, SessionTerminationReason.CLIENT_STOPPED_SESSION);
    assertEquals(0, activeTestSessions.unmodifiableSet().size());
  }

  @Test
  public void testFindSessionByInternalKey() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    assertEquals(testSession,
                 activeTestSessions.findSessionByInternalKey(testSession.getInternalKey()));
  }

  @Test
  public void testGetExistingSession() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    assertEquals(testSession, activeTestSessions.getExistingSession(testSession.getExternalKey()));

  }

  @Test
  public void testGetTerminatedSession() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    activeTestSessions.remove( testSession, SessionTerminationReason.ORPHAN);
    try {
      activeTestSessions.getExistingSession(testSession.getExternalKey());
      fail("should have thrown a session has been orphaned.");
    }  catch (GridException e) {
      assertTrue(e.getMessage().contains(SessionTerminationReason.ORPHAN.toString()));
    }

  }

  @Test
  public void testFindSessionByExternalKey() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    assertEquals(testSession,
                 activeTestSessions.findSessionByExternalKey(testSession.getExternalKey()));
  }

  private TestSession createTestSession() {
    final HashMap<String, Object> capabilities = new HashMap<>();
    final TestSessionTest.TestTimeSource timeSource = new TestSessionTest.TestTimeSource();
    // Luckily we can pass null for TestSlot
    TestSession testSession = new TestSession(null, capabilities, timeSource);
    testSession.setExternalKey(new ExternalSessionKey("w00t!"));
    return testSession;
  }
}
