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
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import com.beust.jcommander.IStringConverter;
import com.beust.jcommander.Parameter;

import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.io.IOException;

public class GridHubConfiguration extends GridConfiguration {

  @Parameter(
    names = "-hubConfig",
    description =  "a JSON file following grid2 format that defines the hub properties."
  )
  public String hubConfig;

  @Parameter(
    names = "-jettyMaxThreads",
    description = "max number of thread for Jetty. Default is normally 255."
  )
  public Integer jettyMaxThreads;

  @Parameter(
    names = {"-matcher", "-capabilityMatcher"},
    description = "a class implementing the CapabilityMatcher interface. Defaults to org.openqa.grid.internal.utils.DefaultCapabilityMatcher. Specify the logic the hub will follow to define if a request can be assigned to a node.Change this class if you want to have the matching process use regular expression instead of exact match for the version of the browser for instance. All the nodes of a grid instance will use the same capabilityMatcher, defined by the registry.",
    converter = CapabilityMatcherString.class
  )
  public CapabilityMatcher capabilityMatcher = new DefaultCapabilityMatcher();

  @Parameter(
    names = "-newSessionWaitTimeout",
    description = "<Integer> milliseconds. Default to no timeout ( -1 ) the time in ms after which a new test waiting for a node to become available will time out.When that happens, the test will throw an exception before starting a browser."
  )
  public Integer newSessionWaitTimeout = -1;

  @Parameter(
    names = "-prioritizer",
    description = "a class implementing the Prioritizer interface. Default to null ( no priority = FIFO ).Specify a custom prioritizer if you want to sort the order new session requests are processed when there is a queue.",
    converter = PrioritizerString.class
  )
  public Prioritizer prioritizer = null;

  @Parameter(
    names = "-throwOnCapabilityNotPresent",
    description = "<true | false> default to true. If true, the hub will reject test requests right away if no proxy is currently registered that can host that capability.Set it to false to have the request queued until a node supporting the capability is added to the grid."
  )
  public Boolean throwOnCapabilityNotPresent = true;

  private static final GridHubConfiguration DEFAULT_CONFIG = loadFromJSON(JSONConfigurationUtils.loadJSON("defaults/DefaultHub.json"));

  public GridHubConfiguration() {
    if (DEFAULT_CONFIG != null) {
      merge(DEFAULT_CONFIG);
    }
  }

  /**
   * @param json JsonObject to load configuration from
   */
  public static GridHubConfiguration loadFromJSON(JsonObject json) {

    try {
      GsonBuilder builder = new GsonBuilder();
      GridHubConfiguration.staticAddJsonTypeAdapter(builder);
      return builder.create().fromJson(json, GridHubConfiguration.class);
    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
                                           e);
    }
  }

  private class PrioritizerString implements IStringConverter<Prioritizer> {
    @Override
    public Prioritizer convert(String prioritizerClass) {
      try {
        return (Prioritizer) Class.forName(prioritizerClass).newInstance();
      } catch (Throwable e) {
        throw new GridConfigurationException("Error creating the prioritize from class " +
                                             prioritizerClass + " : " + e.getMessage(), e);
      }
    }
  }

  private class CapabilityMatcherString implements IStringConverter<CapabilityMatcher> {
    @Override
    public CapabilityMatcher convert(String capabilityMatcherClass) {
      try {
        return (CapabilityMatcher) Class.forName(capabilityMatcherClass).newInstance();
      } catch (Throwable e) {
        throw new GridConfigurationException("Error creating the prioritize from class " +
                                             capabilityMatcherClass + " : " + e.getMessage(), e);
      }
    }
  }


  public void merge(GridNodeConfiguration other) {
    super.merge(other);
  }

  public void merge(GridHubConfiguration other) {
    super.merge(other);
    if (other.jettyMaxThreads != null) {
      jettyMaxThreads = other.jettyMaxThreads;
    }
    capabilityMatcher = other.capabilityMatcher;
    if (other.newSessionWaitTimeout != null) {
      newSessionWaitTimeout = other.newSessionWaitTimeout;
    }
    if (other.prioritizer != null) {
      prioritizer = other.prioritizer;
    }
    if (other.throwOnCapabilityNotPresent != throwOnCapabilityNotPresent) {
      throwOnCapabilityNotPresent = other.throwOnCapabilityNotPresent;
    }
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "hubConfig", hubConfig));
    sb.append(toString(format, "jettyMaxThreads", jettyMaxThreads));
    sb.append(toString(format, "capabilityMatcher", capabilityMatcher.getClass().getCanonicalName()));
    sb.append(toString(format, "newSessionWaitTimeout", newSessionWaitTimeout));
    sb.append(toString(format, "prioritizer", prioritizer != null? prioritizer.getClass().getCanonicalName(): null));
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
