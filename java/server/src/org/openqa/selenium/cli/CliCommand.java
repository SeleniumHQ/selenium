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

package org.openqa.selenium.cli;

import org.openqa.selenium.grid.config.Role;

import java.io.PrintStream;
import java.util.Set;

public interface CliCommand {

  String getName();

  String getDescription();

  /**
   * Allows a command to indicate that certain aspects are configurable.
   * Any roles that are exposed here will be matched against flag objects
   * which implement {@link org.openqa.selenium.grid.config.HasRoles} to
   * allow configuration via command line flags.
   */
  Set<Role> getConfigurableRoles();

  /**
   * Allows the set of objects used for finding command-line flags to be
   * augmented with default implementations.
   */
  Set<Object> getFlagObjects();

  Executable configure(PrintStream out, PrintStream err, String... args);

  default boolean isShown() {
    return true;
  }

  interface Executable {

    void run();
  }

}
