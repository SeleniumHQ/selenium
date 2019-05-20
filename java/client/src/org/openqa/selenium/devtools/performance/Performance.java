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

package org.openqa.selenium.devtools.performance;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;

import java.util.List;
import java.util.Objects;

/**
 * All available DevTools Network methods and events <a href="https://chromedevtools.github.io/devtools-protocol/tot/Performance">Google Documentation</a>
 */
public class Performance {

  /**
   * Disable collecting and reporting metrics.
   */
  public static Command<Void> disable() {
    return new Command<>("Performance.disable", ImmutableMap.of());
  }

  /**
   * Enable collecting and reporting metrics.
   */
  public static Command<Void> enable() {
    return new Command<>("Performance.enable", ImmutableMap.of());
  }

  /**
   * Warning this is an Experimental Method
   * Sets time domain to use for collecting and reporting duration metrics. Note that this must be called before enabling metrics collection.
   * Calling this method while metrics collection is enabled returns an error.EXPERIMENTAL
   *
   * @param timeDomain - {@link TimeDomain}
   */
  @Beta
  public static Command<Void> setTimeDomain(TimeDomain timeDomain) {
    Objects.requireNonNull(timeDomain, "'timeDomain' must be set");
    return new Command<>("Performance.setTimeDomain",
                         ImmutableMap.of("timeDomain", timeDomain.name()));
  }

  /**
   * Retrieve current values of run-time metrics.
   *
   * @return List of {@link List}
   */
  public static Command<List<Metric>> getMetrics() {
    return new Command<>("Performance.getMetrics", ImmutableMap.of(),
                         map("metrics", new TypeToken<List<Metric>>() {
                         }.getType()));
  }


}
