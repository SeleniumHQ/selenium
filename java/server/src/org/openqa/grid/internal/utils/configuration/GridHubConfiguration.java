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

package org.openqa.grid.internal.utils.configuration;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.TypeAdapter;
import com.google.gson.annotations.Expose;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import com.beust.jcommander.Parameter;

import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.configuration.converters.StringToClassConverter;
import org.openqa.grid.internal.utils.configuration.validators.FileExistsValueValidator;

import java.io.IOException;

public class GridHubConfiguration extends GridConfiguration {
  public static final String DEFAULT_HUB_CONFIG_FILE = "defaults/DefaultHub.json";

  /*
   * IMPORTANT - Keep these constant values in sync with the ones specified in
   * 'defaults/DefaultHub.json'  -- if for no other reasons documentation & consistency.
   */

  /**
   * Default hub role
   */
  static final String DEFAULT_ROLE = "hub";

  /**
   * Default hub port
   */
  static final Integer DEFAULT_PORT = 4444;

  /**
   * Default hub cleanup cycle
   */
  static final Integer DEFAULT_CLEANUP_CYCLE = 5000;

  /**
   * Default hub new session wait timeout
   */
  static final Integer DEFAULT_NEW_SESSION_WAIT_TIMEOUT = -1;

  /**
   * Default hub throw on capability not present toggle
   */
  static final Boolean DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE = true;

  /*
   * config parameters which do not serialize or de-serialize
   */

  /**
   * Hub specific json config file to use. Defaults to {@code null}.
   */
  @Parameter(
    names = "-hubConfig",
    description =  "<String> filename: a JSON file (following grid2 format), which defines the hub properties",
    validateValueWith = FileExistsValueValidator.class
  )
  public String hubConfig;

  /*
   * config parameters which serialize and deserialize to/from json
   */

  /**
   * Capability matcher to use. Defaults to {@link DefaultCapabilityMatcher}
   */
  @Expose
  @Parameter(
    names = { "-matcher", "-capabilityMatcher" },
    description = "<String> class name : a class implementing the CapabilityMatcher interface. Specifies the logic the hub will follow to define whether a request can be assigned to a node. For example, if you want to have the matching process use regular expressions instead of exact match when specifying browser version. ALL nodes of a grid ecosystem would then use the same capabilityMatcher, as defined here.",
    converter = StringToClassConverter.CapabilityMatcherStringConverter.class
  )
  public CapabilityMatcher capabilityMatcher = new DefaultCapabilityMatcher();

  /**
   * Timeout for new session requests. Defaults to unlimited.
   */
  @Expose
  @Parameter(
    names = "-newSessionWaitTimeout",
    description = "<Integer> in ms : The time after which a new test waiting for a node to become available will time out. When that happens, the test will throw an exception before attempting to start a browser. An unspecified, zero, or negative value means wait indefinitely."
  )
  public Integer newSessionWaitTimeout = DEFAULT_NEW_SESSION_WAIT_TIMEOUT;

  /**
   * Prioritizer for new honoring session requests based on some priority. Defaults to {@code null}.
   */
  @Expose
  @Parameter(
    names = "-prioritizer",
    description = "<String> class name : a class implementing the Prioritizer interface. Specify a custom Prioritizer if you want to sort the order in which new session requests are processed when there is a queue. Default to null ( no priority = FIFO )",
    converter = StringToClassConverter.PrioritizerStringConverter.class
  )
  public Prioritizer prioritizer;

  /**
   * Whether to throw an Exception when there are no capabilities available that match the request. Defaults to {@code true}.
   */
  @Expose
  @Parameter(
    names = "-throwOnCapabilityNotPresent",
    description = "<Boolean> true or false : If true, the hub will reject all test requests if no compatible proxy is currently registered. If set to false, the request will queue until a node supporting the capability is registered with the grid.",
    arity = 1
  )
  public Boolean throwOnCapabilityNotPresent = DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE;

  /**
   * Creates a new configuration using the default values.
   */
  public GridHubConfiguration() {
    // overrides values set by base classes
    role = DEFAULT_ROLE;
    port = DEFAULT_PORT;
    cleanUpCycle = DEFAULT_CLEANUP_CYCLE;
  }

  /**
   * @param filePath hub config json file to load configuration from
   */
  public static GridHubConfiguration loadFromJSON(String filePath) {
    return loadFromJSON(JSONConfigurationUtils.loadJSON(filePath));
  }

  /**
   * @param json JsonObject to load configuration from
   */
  public static GridHubConfiguration loadFromJSON(JsonObject json) {
    try {
      GsonBuilder builder = new GsonBuilder();
      GridHubConfiguration.staticAddJsonTypeAdapter(builder);
      return builder.excludeFieldsWithoutExposeAnnotation().create()
        .fromJson(json, GridHubConfiguration.class);
    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
                                           e);
    }
  }

  /**
   * Merge this configuration with the specified {@link GridNodeConfiguration}
   * @param other
   */
  public void merge(GridNodeConfiguration other) {
    super.merge(other);
  }

  /**
   * Merge this configuration with the specified {@link GridHubConfiguration}
   * @param other
   */
  public void merge(GridHubConfiguration other) {
    if (other == null) {
      return;
    }
    super.merge(other);

    if (isMergeAble(other.capabilityMatcher, capabilityMatcher)) {
      capabilityMatcher = other.capabilityMatcher;
    }
    if (isMergeAble(other.newSessionWaitTimeout, newSessionWaitTimeout)) {
      newSessionWaitTimeout = other.newSessionWaitTimeout;
    }
    if (isMergeAble(other.prioritizer, prioritizer)) {
      prioritizer = other.prioritizer;
    }
    if (isMergeAble(other.throwOnCapabilityNotPresent, throwOnCapabilityNotPresent)) {
      throwOnCapabilityNotPresent = other.throwOnCapabilityNotPresent;
    }
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "hubConfig", hubConfig));
    sb.append(toString(format, "capabilityMatcher", capabilityMatcher.getClass().getCanonicalName()));
    sb.append(toString(format, "newSessionWaitTimeout", newSessionWaitTimeout));
    sb.append(toString(format, "prioritizer", prioritizer != null ? prioritizer.getClass().getCanonicalName(): null));
    sb.append(toString(format, "throwOnCapabilityNotPresent", throwOnCapabilityNotPresent));
    return sb.toString();
  }

  @Override
  protected void addJsonTypeAdapter(GsonBuilder builder) {
    super.addJsonTypeAdapter(builder);
    GridHubConfiguration.staticAddJsonTypeAdapter(builder);
  }
  protected static void staticAddJsonTypeAdapter(GsonBuilder builder) {
    builder.registerTypeAdapter(CapabilityMatcher.class, new CapabilityMatcherAdapter().nullSafe());
    builder.registerTypeAdapter(Prioritizer.class, new PrioritizerAdapter().nullSafe());
  }

  protected static class SimpleClassNameAdapter<T> extends TypeAdapter<T> {
    @Override
    public void write(JsonWriter out, T value) throws IOException {
      out.value(value.getClass().getCanonicalName());
    }
    @Override
    public T read(JsonReader in) throws IOException {
      String value = in.nextString();
      try {
        return (T) Class.forName(value).newInstance();
      } catch (Exception e) {
        throw new RuntimeException(String.format("String %s could not be coerced to class: %s", value, Class.class.getName()), e);
      }
    }
  }

  protected static class CapabilityMatcherAdapter extends SimpleClassNameAdapter<CapabilityMatcher> {
  }

  protected static class PrioritizerAdapter extends SimpleClassNameAdapter<Prioritizer> {
  }
}
