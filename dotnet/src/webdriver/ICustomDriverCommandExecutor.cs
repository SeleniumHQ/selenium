// <copyright file="ICustomDriverCommandExecutor.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Exposes an interface to allow drivers to register and execute custom commands.
    /// </summary>
    public interface ICustomDriverCommandExecutor
    {
        /// <summary>
        /// Executes a command with this driver.
        /// </summary>
        /// <param name="driverCommandToExecute">The name of the command to execute. The command name must be registered with the command executor, and must not be a command name known to this driver type.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
        /// <returns>An object that contains the value returned by the command, if any.</returns>
        object ExecuteCustomDriverCommand(string driverCommandToExecute, Dictionary<string, object> parameters);

        /// <summary>
        /// Registers a set of commands to be executed with this driver instance.
        /// </summary>
        /// <param name="commands">An <see cref="IReadOnlyDictionary{string, CommandInfo}"/> where the keys are the names of the commands to register, and the values are the <see cref="CommandInfo"/> objects describing the commands.</param>
        void RegisterCustomDriverCommands(IReadOnlyDictionary<string, CommandInfo> commands);

        /// <summary>
        /// Registers a command to be executed with this driver instance.
        /// </summary>
        /// <param name="commandName">The unique name of the command to register.</param>
        /// <param name="commandInfo">The <see cref="CommandInfo"/> object describing the command.</param>
        /// <returns><see langword="true"/> if the command was registered; otherwise, <see langword="false"/>.</returns>
        bool RegisterCustomDriverCommand(string commandName, CommandInfo commandInfo);
    }
}
