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

package org.openqa.selenium.remote;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.http.HttpMethod;

/**
 * Converts {@link Command} objects to and from another representation.
 *
 * @param <T> The type of an encoded command.
 */
public interface CommandCodec<T> {

  /**
   * Encodes a command.
   *
   * @param command the command to encode.
   * @return the encoded command.
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  T encode(Command command);

  /**
   * Decodes a command.
   *
   * @param encodedCommand the command to decode.
   * @return the decoded command.
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  Command decode(T encodedCommand);

  /**
   * Enhance this command codec with additional commands.
   */
  void defineCommand(String name, HttpMethod method, String pathPattern);

  /**
   * Allow commands to have aliases.
   * @param commandName The command being added.
   * @param isAnAliasFor The command name that this is an alias for.
   */
  void alias(String commandName, String isAnAliasFor);
}
