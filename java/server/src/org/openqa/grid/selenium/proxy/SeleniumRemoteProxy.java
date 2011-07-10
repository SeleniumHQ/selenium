/*
Copyright 2007-2011 WebDriver committers

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

package org.openqa.grid.selenium.proxy;

import java.util.Map;
import java.util.logging.Logger;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;


public class SeleniumRemoteProxy extends WebRemoteProxy implements CommandListener {

  public SeleniumRemoteProxy(RegistrationRequest request, Registry registry) {
    super(request, registry);
  }

  private static final Logger log = Logger.getLogger(SeleniumRemoteProxy.class.getName());

  @Override
  public void beforeRelease(TestSession session) {
    // release the resources remotely.
    if (session.getExternalKey() == null) {
      throw new IllegalStateException("No internal key yet. Did the app start properly?");
    }
    System.err.println("timing out " + session);
    boolean ok;
    try {
      ok = session.sendSelenium1TestComplete(session);
    } catch (Throwable t) {
      t.printStackTrace();
      ok = false;
    }
    if (!ok) {
      log.warning("Error releasing the resources on timeout for session " + session);
    }

  }

  private CapabilityMatcher matchFFprofileToo;


  // TODO freynaud : no real point checking that.
  @Override
  public CapabilityMatcher getCapabilityHelper() {
    if (matchFFprofileToo == null) {
      matchFFprofileToo = new DefaultCapabilityMatcher() {
        @Override
        public boolean matches(Map<String, Object> currentCapability, Map<String, Object> requestedCapability) {
          String path = (String) requestedCapability.get("profilePath");
          if (path != null && !path.equals(currentCapability.get("profilePath"))) {
            return false;
          }
          if (path == null && currentCapability.get("profilePath") != null) {
            return false;
          }

          return super.matches(currentCapability, requestedCapability);
        }
      };
    }
    return matchFFprofileToo;
  }
}
