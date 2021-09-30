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

package org.openqa.selenium.remote.session;

import java.util.Collection;
import java.util.Map;
import java.util.function.Function;

/**
 * Takes a capability and allows it to be transformed into 0, 1, or n different capabilities for a
 * W3C New Session payload.
 */
@FunctionalInterface
public interface CapabilityTransform
  extends Function<Map.Entry<String, Object>, Collection<Map.Entry<String, Object>>>
{

  /**
   * @return {@code null} to remove the capability, or a collection of {@link Map.Entry} instances.
   */
  @Override
  Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry);
}
