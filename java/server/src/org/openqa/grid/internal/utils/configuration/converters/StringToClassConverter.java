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

package org.openqa.grid.internal.utils.configuration.converters;

import com.beust.jcommander.IStringConverter;

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;

public abstract class StringToClassConverter<E> {
  public E convert(String capabilityMatcherClass) {
    try {
      return (E) Class.forName(capabilityMatcherClass).newInstance();
    } catch (Throwable e) {
      throw new GridConfigurationException("Error creating class with " +
                                           capabilityMatcherClass + " : " + e.getMessage(), e);
    }
  }

  public static class CapabilityMatcherStringConverter extends StringToClassConverter<CapabilityMatcher> implements IStringConverter<CapabilityMatcher>{}

  public static class PrioritizerStringConverter extends StringToClassConverter<Prioritizer> implements IStringConverter<Prioritizer>{}

}
