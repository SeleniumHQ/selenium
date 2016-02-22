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

package org.openqa.selenium.remote.server;

import com.beust.jcommander.Parameter;

/**
 * Command line args for the selenium server.
 */
public class CommandLineArgs {
  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "This help.")
  boolean help;

  @Parameter(
    names = "-browserTimeout",
    description = "Number of seconds a browser is allowed to hang (0 means indefinite).")
  int browserTimeout;

  @Parameter(
    names = "-jettyThreads",
    hidden = true)
  int jettyThreads;

  @Parameter(
    names = {"-port"},
    description = "The port number the selenium server should use.")
  int port = 4444;

  @Parameter(
    names = "-timeout",
    description = "Number of seconds we should allow a client to be idle (0 means indefinite).")
  int timeout;
}
