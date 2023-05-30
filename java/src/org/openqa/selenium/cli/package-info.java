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

/**
 * Mechanisms to configure and run selenium via the command line. There are two key classes {@link
 * org.openqa.selenium.cli.CliCommand} and {@link org.openqa.selenium.grid.config.HasRoles}.
 * Ultimately, these are used to build a {@link org.openqa.selenium.grid.config.Config} instance,
 * for which there are strongly-typed role-specific classes that use a {@code Config}, such as
 * {@link org.openqa.selenium.grid.node.docker.DockerOptions}.
 *
 * <p>Assuming your {@code CliCommand} extends {@link org.openqa.selenium.grid.TemplateGridCommand},
 * the process for building the set of flags to use is:
 *
 * <ol>
 *   <li>The default flags are added (these are {@link org.openqa.selenium.grid.server.HelpFlags}
 *       and {@link org.openqa.selenium.grid.config.ConfigFlags}
 *   <li>{@link java.util.ServiceLoader} is used to find all implementations of {@link
 *       org.openqa.selenium.grid.config.HasRoles} where {@link
 *       org.openqa.selenium.grid.config.HasRoles#getRoles()} is contained within {@link
 *       org.openqa.selenium.cli.CliCommand#getConfigurableRoles()}.
 *   <li>Finally all flags returned by {@link
 *       org.openqa.selenium.grid.TemplateGridCommand#getFlagObjects()} are added.
 * </ol>
 *
 * <p>The flags are then used by JCommander to parse the command arguments. Once that's done, the
 * raw flags are converted to a {@link org.openqa.selenium.grid.config.Config} by combining all of
 * the flag objects with system properties and environment variables. This implies that each flag
 * object has annotated each field with {@link org.openqa.selenium.grid.config.ConfigValue}.
 *
 * <p>Ultimately, this means that flag objects have all (most?) fields annotated with JCommander's
 * {@link com.beust.jcommander.Parameter} annotation as well as {@code ConfigValue}.
 */
package org.openqa.selenium.cli;
