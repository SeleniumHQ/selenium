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

package org.openqa.selenium.remote;

import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.CapabilityType.STRICT_FILE_INTERACTABILITY;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;
import static org.openqa.selenium.remote.CapabilityType.UNHANDLED_PROMPT_BEHAVIOUR;

import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.internal.Require;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

public abstract class AbstractDriverOptions<DO extends AbstractDriverOptions> extends MutableCapabilities {

  public DO setPageLoadStrategy(PageLoadStrategy strategy) {
    setCapability(
        PAGE_LOAD_STRATEGY,
        Require.nonNull("Page load strategy", strategy));
    return (DO) this;
  }

  public DO setUnhandledPromptBehaviour(UnexpectedAlertBehaviour behaviour) {
    setCapability(
        UNHANDLED_PROMPT_BEHAVIOUR,
        Require.nonNull("Unhandled prompt behavior", behaviour));
    return (DO) this;
  }

  public DO setAcceptInsecureCerts(boolean acceptInsecureCerts) {
    setCapability(ACCEPT_INSECURE_CERTS, acceptInsecureCerts);
    return (DO) this;
  }

  public DO setStrictFileInteractability(boolean strictFileInteractability) {
    setCapability(STRICT_FILE_INTERACTABILITY, strictFileInteractability);
    return (DO) this;
  }

  public DO setProxy(Proxy proxy) {
    setCapability(PROXY, Require.nonNull("Proxy", proxy));
    return (DO) this;
  }

  @Override
  public Set<String> getCapabilityNames() {
    TreeSet<String> names = new TreeSet<>(super.getCapabilityNames());
    names.addAll(getExtraCapabilityNames());
    return Collections.unmodifiableSet(names);
  }

  protected abstract Set<String> getExtraCapabilityNames();

  @Override
  public Object getCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);

    if (getExtraCapabilityNames().contains(capabilityName)) {
      return getExtraCapability(capabilityName);
    }
    return super.getCapability(capabilityName);
  }

  protected abstract Object getExtraCapability(String capabilityName);

  @Override
  public Map<String, Object> asMap() {
    Map<String, Object> toReturn = new TreeMap<>(super.asMap());
    getExtraCapabilityNames().forEach(name -> toReturn.put(name, getCapability(name)));
    return Collections.unmodifiableMap(toReturn);
  }
}
