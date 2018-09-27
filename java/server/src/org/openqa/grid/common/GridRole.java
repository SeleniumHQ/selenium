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

public enum GridRole {
  NOT_GRID, HUB, NODE;

  private static final String WD_S = "wd";
  private static final String WEBDRIVER_S = "webdriver";
  private static final String NODE_S = "node";
  private static final String HUB_S = "hub";
  private static final String STANDALONE_S = "standalone";

  public static GridRole get(String role) {
    if (role == null || role.equals("")) {
      return NOT_GRID;
    }
    switch (role) {
      case WD_S:
      case WEBDRIVER_S:
      case NODE_S:
        return NODE;

      case HUB_S:
        return HUB;

      case STANDALONE_S:
        return NOT_GRID;

      default:
        return null;
    }
  }

  public String toString() {
    switch (this) {
      case NODE:
        return NODE_S;

      case HUB:
        return HUB_S;

      case NOT_GRID:
        return STANDALONE_S;

      default:
        throw new IllegalStateException("Unrecognized GridRole");
    }
  }
}
