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

package org.openqa.grid.common;

import com.google.common.collect.ImmutableList;

import org.openqa.grid.common.exception.GridConfigurationException;

import java.util.List;

public enum GridRole {
  NOT_GRID, HUB, NODE;

  private static List<String> rcAliases = new ImmutableList.Builder<String>()
    .add("rc")
    .add("remotecontrol")
    .add("remote-control")
    .build();

  private static List<String> wdAliases = new ImmutableList.Builder<String>()
    .add("wd")
    .add("webdriver")
    .build();

  private static List<String> nodeAliases = new ImmutableList.Builder<String>()
    .add("node")
    .addAll(rcAliases)
    .addAll(wdAliases)
    .build();

  /**
   * finds the requested role from the parameters.
   *
   * @param args command line arguments
   * @return the role in the grid from the -role param
   */
  public static GridRole find(String[] args) {
    if (args == null) {
      return NOT_GRID;
    }
    for (int i = 0; i < args.length; i++) {
      if ("-role".equals(args[i])) {
        if (i == args.length - 1) {
          return null;
        } else {
          String role = args[i + 1].toLowerCase();
          if (nodeAliases.contains(role)) {
            return NODE;
          } else if ("hub".equals(role)) {
            return HUB;
          } else if ("standalone".equals(role)) {
            return NOT_GRID;
          } else {
            return null;
          }
        }
      }
    }
    return NOT_GRID;
  }

  public static boolean isRC(String nodeType) {
    return rcAliases.contains(nodeType);
  }

  public static boolean isWebDriver(String nodeType) {
    return wdAliases.contains(nodeType);
  }
}
