/*
Copyright 2011 WebDriver committers
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

package org.openqa.grid.internal;

import net.jcip.annotations.ThreadSafe;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Logger;

/**
 * The set of active test sessions.
 */
@ThreadSafe
class ActiveTestSessions {

  private static final Logger log = Logger.getLogger(ActiveTestSessions.class.getName());

  private final Set<TestSession> activeTestSessions = new CopyOnWriteArraySet<TestSession>();



  public boolean add(TestSession testSession) {
    final boolean added = activeTestSessions.add(testSession);
    if (!added) {
      log.severe("Error adding session : " + testSession);
    }
    return added;
  }

  public boolean remove(TestSession o) {
    return activeTestSessions.remove(o);
  }

  public TestSession findSessionByInternalKey(String internalKey) {
    if (internalKey == null) {
      return null;
    }

    for (TestSession session : activeTestSessions) {
      if (internalKey.equals(session.getInternalKey())) {
        return session;
      }
    }
    return null;
  }

  public TestSession findSessionByExternalKey(ExternalSessionKey externalkey) {
    if (externalkey == null) {
      return null;
    }

    for (TestSession session : activeTestSessions) {
      if (externalkey.equals(session.getExternalKey())) {
        return session;
      }
    }
    return null;
  }

  public Set<TestSession> unmodifiableSet(){
    return Collections.unmodifiableSet( activeTestSessions);
  }

}
