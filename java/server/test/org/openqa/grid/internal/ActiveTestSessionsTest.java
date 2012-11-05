package org.openqa.grid.internal;
/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import org.junit.Test;

import java.util.HashMap;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

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
  public void testGetTeraminatedSession() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    activeTestSessions.remove( testSession, SessionTerminationReason.ORPHAN);
    assertNull(activeTestSessions.getExistingSession(testSession.getExternalKey()));
  }

  @Test
  public void testFindSessionByExternalKey() throws Exception {
    TestSession testSession = createTestSession();
    activeTestSessions.add(testSession);
    assertEquals(testSession,
                 activeTestSessions.findSessionByExternalKey(testSession.getExternalKey()));
  }

  private TestSession createTestSession() {
    final HashMap<String, Object> capabilities = new HashMap<String, Object>();
    final TestSessionTest.TestTimeSource timeSource = new TestSessionTest.TestTimeSource();
    // Luckily we can pass null for TestSlot
    TestSession testSession = new TestSession(null, capabilities, timeSource);
    testSession.setExternalKey(new ExternalSessionKey("w00t!"));
    return testSession;
  }
}
