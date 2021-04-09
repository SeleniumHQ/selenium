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

package org.openqa.selenium.grid.server;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import org.openqa.selenium.BuildInfo;

import java.io.PrintStream;

public class HelpFlags {

  @Parameter(names = {"-h", "-help", "--help", "/?"}, help = true, hidden = true)
  private boolean help;

  @Parameter(names = "--version", description = "Displays the version and exits.")
  private boolean version;

  public boolean displayHelp(JCommander commander, PrintStream outputTo) {
    if (version) {
      BuildInfo info = new BuildInfo();

      outputTo.printf(
          "%s version: %s, revision: %s%n",
          commander.getProgramName(),
          info.getReleaseLabel(),
          info.getBuildRevision());

      return true;
    }

    if (help) {
      commander.usage();
      return true;
    }

    return false;
  }
}
