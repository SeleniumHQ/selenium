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
package org.openqa.grid.internal.listeners;

import org.openqa.grid.internal.TestSession;

/**
 * To be implemented by a class extending RemoteProxy.
 * <p/>
 * WARNING : the before and after are executed by the proxy on the remote, and the action taken in
 * those method are not isolated, and can have consequences on other sessions.
 * <p/>
 * If some changes are made that can impact all running tests, the before / after implementation
 * should take care of checking that no test are currently running to avoid collateral damages
 * <p/>
 * For the case when a single remote handles multiple test sessions ( typical web driver ) using
 * before / after will impact ALL the tests on that remote.
 */
public interface TestSessionListener {

  /**
   * Will be run after the proxy slot is reserved for the test, but before the first command is
   * forwarded to the remote.
   * <p/>
   * Gives a chance to do a setup on the remote before the test start.
   * <p/>
   * WARNING : beforeSession should NOT throw exception. If an exception is thrown, the session is
   * considered invalid and the resources will be freed.
   * 
   * @param session
   * @see RegistrationListener if the setup applies to all the tests.
   */
  public void beforeSession(TestSession session);

  /**
   * Will be run after the last command is forwarded, but before the proxy slot is released.
   * <p/>
   * If the test crashes before a session is provided by the remote, session.externalKey will be
   * null.
   * <p/>
   * WARNING : after session should NOT throw exception. If an exception is thrown, the resources
   * will NOT be released, as it could mean the remote is now corrupted.
   */
  public void afterSession(TestSession session);

}
