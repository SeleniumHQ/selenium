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

public interface TimeoutListener {

  /**
   * Gives a chance to clean the resources on the remote when the session has timed out.
   * <p/>
   * Is executed before the session is released to the hub. If an exception is thrown, the slot that
   * was associated with the session is considered corrupted and won't be released for future use.
   * <p/>
   * You can check session.getInternalKey before timing out. internalkey==null usually means the
   * initial POST /session hasn't been completed yet.For instance if you use web driver, that means
   * the browser is in the process of being started. During that state, you can't really clean the
   * resources properly.
   * 
   * @param session
   */
  public void beforeRelease(TestSession session);

}
