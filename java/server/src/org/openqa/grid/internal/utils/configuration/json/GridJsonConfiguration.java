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

package org.openqa.grid.internal.utils.configuration.json;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class GridJsonConfiguration extends CommonJsonConfiguration {

  private Map<String, String> custom = new HashMap<>();
  private List<String> servlets = new ArrayList<>();
  private List<String> withoutServlets = new ArrayList<>();
  
  public GridJsonConfiguration() {
	  super();
  }
  
  public GridJsonConfiguration(GridJsonConfiguration gridJsonConfig) {
	  super(gridJsonConfig);
	  custom = new HashMap<>(gridJsonConfig.custom);
	  servlets = new ArrayList<>(gridJsonConfig.servlets);
	  withoutServlets = new ArrayList<>(gridJsonConfig.withoutServlets);
  }

  /**
   * Custom key/value pairs for the hub registry. Default empty.
   */
  public Map<String, String> getCustom() {
    return custom;
  }

  /**
   * Extra servlets to initialize/use on the hub or node. Default empty.
   */
  public List<String> getServlets() {
    return servlets;
  }

  /**
   * Default servlets to exclude on the hub or node. Default empty.
   */
  public List<String> getWithoutServlets() {
    return withoutServlets;
  }

}
