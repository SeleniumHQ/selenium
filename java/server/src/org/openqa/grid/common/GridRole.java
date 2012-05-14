/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.common;

import org.openqa.grid.common.exception.GridConfigurationException;

import java.util.ArrayList;
import java.util.List;

public enum GridRole {
  NOT_GRID, HUB, NODE;

  /**
   * finds the requested role from the parameters.
   * 
   * @param args
   * @return the role in the grid from the -role param
   */
  public static GridRole find(String[] args) {
    if (args == null) {
      return NOT_GRID;
    }
    for (int i = 0; i < args.length; i++) {
      if ("-role".equals(args[i])) {
        if (i == args.length) {
          throw new GridConfigurationException(
              "-role needs to be followed by the role of this component in the grid.");
        } else {
          String role = args[i + 1].toLowerCase();
          if (NodeAliases().contains(role)) {
            return NODE;
          } else if ("hub".equals(role)) {
            return HUB;
          } else {
            throw new GridConfigurationException("The role specified :" + role
                + " doesn't match a recognized role for grid.");
          }
        }
      }
    }
    return NOT_GRID;
  }

  private static List<String> NodeAliases() {
    List<String> res = new ArrayList<String>();
    res.add("node");
    res.addAll(RCAliases());
    res.addAll(WDAliases());
    return res;
  }
  
  public static List<String> RCAliases() {
    List<String> res = new ArrayList<String>();
    res.add("rc");
    res.add("remotecontrol");
    res.add("remote-control");
    return res;
  }

  public static List<String> WDAliases() {
    List<String> res = new ArrayList<String>();
    res.add("wd");
    res.add("webdriver");
    return res;
  }
}
