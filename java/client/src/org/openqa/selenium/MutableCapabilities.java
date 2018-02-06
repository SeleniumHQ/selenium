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

package org.openqa.selenium;


import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.Collection;
import java.util.ArrayList;

public class MutableCapabilities extends AbstractCapabilities implements Serializable {

  private static final long serialVersionUID = -112816287184979465L;

  private static final Set<String> OPTION_KEYS;
  static {
    HashSet<String> keys = new HashSet<>();
    keys.add("chromeOptions");
    keys.add("edgeOptions");
    keys.add("goog:chromeOptions");
    keys.add("moz:firefoxOptions");
    keys.add("operaOptions");
    keys.add("se:ieOptions");
    keys.add("safari.options");
    OPTION_KEYS = Collections.unmodifiableSet(keys);
  }

  public MutableCapabilities() {
    // no-arg constructor
  }

  public MutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public MutableCapabilities(Map<String, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      if (value != null) {
        setCapability(key, value);
      }
    });
  }

  /**
   * Merges the extra capabilities provided into this DesiredCapabilities instance. If capabilities
   * with the same name exist in this instance, they will be overridden by the values from the
   * extraCapabilities object.
   *
   * @param extraCapabilities Additional capabilities to be added.
   * @return DesiredCapabilities after the merge
   */
  @Override
  public MutableCapabilities merge(Capabilities extraCapabilities) {
    if (extraCapabilities == null) {
      return this;
    }

    extraCapabilities.asMap().forEach(this::setCapability);

    mergeSimpleField("binary", extraCapabilities);
    mergeSimpleField("logLevel", extraCapabilities);

    mergeListField("args", extraCapabilities);
    mergeListField("extensions", extraCapabilities);
    mergeListField("extensionFiles", extraCapabilities);

    mergeMapField("experimentalOptions", extraCapabilities);
    mergeMapField("booleanPrefs", extraCapabilities);
    mergeMapField("intPrefs", extraCapabilities);
    mergeMapField("stringPrefs", extraCapabilities);
    mergeMapField("options", extraCapabilities);

    return this;
  }

  private void mergeSimpleField(String fieldName, Capabilities extraCaps) {
    try {
      Field receiverField = this.getClass().getDeclaredField(fieldName);
      receiverField.setAccessible(true);
      Field sourceField = extraCaps.getClass().getDeclaredField(fieldName);
      sourceField.setAccessible(true);
      receiverField.set(this, sourceField.get(extraCaps));
    } catch (NoSuchFieldException | IllegalAccessException | IllegalArgumentException e) {
    }
  }

  private void mergeListField(String fieldName, Capabilities extraCaps) {
    try {
      Field receiverField = this.getClass().getDeclaredField(fieldName);
      receiverField.setAccessible(true);
      LinkedHashSet<?> set = new LinkedHashSet((Collection) receiverField.get(this));
      Field sourceField = extraCaps.getClass().getDeclaredField(fieldName);
      sourceField.setAccessible(true);
      set.addAll((Collection) sourceField.get(extraCaps));
      receiverField.set(this, new ArrayList(set));
    } catch (NoSuchFieldException | IllegalAccessException e) {
    }
  }

  private void mergeMapField(String fieldName, Capabilities extraCaps) {
    try {
      Field receiverField = this.getClass().getDeclaredField(fieldName);
      receiverField.setAccessible(true);
      Map map =  (Map<?, ?>) receiverField.get(this);
      Field sourceField = extraCaps.getClass().getDeclaredField(fieldName);
      sourceField.setAccessible(true);
      map.putAll((Map<?, ?>) sourceField.get(extraCaps));
      receiverField.set(this, map);
    } catch (NoSuchFieldException | IllegalAccessException e) {
    }
  }


  public void setCapability(String capabilityName, boolean value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String capabilityName, String value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String capabilityName, Platform value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String key, Object value) {
    // We have to special-case some keys and values because of the popular idiom of calling
    // something like "capabilities.setCapability(SafariOptions.CAPABILITY, new SafariOptions());
    // and this is no longer needed as options are capabilities. There will be a large amount of
    // legacy code that will always try and follow this pattern, however.
    if (OPTION_KEYS.contains(key) && value instanceof Capabilities) {
      merge((Capabilities) value);
      return;
    }

    super.setCapability(key, value);
  }
}
