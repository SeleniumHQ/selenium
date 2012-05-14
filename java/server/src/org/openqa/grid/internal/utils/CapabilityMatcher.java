/*
Copyright 2007-2011 Selenium committers

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

package org.openqa.grid.internal.utils;

import org.openqa.grid.internal.RemoteProxy;

import java.util.Map;

/**
 * Used to find out if a capabilities requested by the client matches something on the remote and
 * should be forwarded by the grid.
 * 
 * @link {@link RemoteProxy#setCapabilityHelper(CapabilityHelper)}
 */
public interface CapabilityMatcher {
  public boolean matches(Map<String, Object> currentCapability,
      Map<String, Object> requestedCapability);
}
