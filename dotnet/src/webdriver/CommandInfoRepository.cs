// <copyright file="CommandInfoRepository.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Holds the information about all commands specified by the JSON wire protocol.
    /// This class cannot be inherited, as it is intended to be a singleton, and
    /// allowing subclasses introduces the possibility of multiple instances.
    /// </summary>
    public abstract class CommandInfoRepository
    {
        private readonly Dictionary<string, CommandInfo> commandDictionary;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommandInfoRepository"/> class.
        /// Protected accessibility prevents a default instance from being created.
        /// </summary>
        protected CommandInfoRepository()
        {
            this.commandDictionary = new Dictionary<string, CommandInfo>();
        }

        /// <summary>
        /// Gets the level of the W3C WebDriver specification that this repository supports.
        /// </summary>
        public abstract int SpecificationLevel { get; }

        /// <summary>
        /// Gets the <see cref="Type"/> that is valid for this <see cref="CommandInfoRepository"/>
        /// </summary>
        protected abstract Type RepositoryCommandInfoType { get; }

        /// <summary>
        /// Gets a value indicating whether a command with a given name has been defined.
        /// </summary>
        /// <param name="commandName">The name of the command to check.</param>
        /// <returns><see langword="true"/> if the command name is defined</returns>
        public bool IsCommandNameDefined(string commandName)
        {
            return this.commandDictionary.ContainsKey(commandName);
        }

        /// <summary>
        /// Finds a command name for a given <see cref="CommandInfo"/>.
        /// </summary>
        /// <param name="commandInfo">The <see cref="CommandInfo"/> object for which to find the command name.</param>
        /// <returns>The name of the command defined by the command info, or <see langword=""="null"/> if the command is not defined.</returns>
        public string FindCommandName(CommandInfo commandInfo)
        {
            foreach(KeyValuePair<string, CommandInfo> pair in this.commandDictionary)
            {
                if (pair.Value == commandInfo)
                {
                    return pair.Key;
                }
            }

            return null;
        }

        /// <summary>
        /// Gets the <see cref="HttpCommandInfo"/> for a <see cref="DriverCommand"/>.
        /// </summary>
        /// <param name="commandName">The <see cref="DriverCommand"/> for which to get the information.</param>
        /// <returns>The <see cref="HttpCommandInfo"/> for the specified command.</returns>
        public T GetCommandInfo<T>(string commandName) where T : CommandInfo
        {
            T toReturn = default(T);
            if (this.commandDictionary.ContainsKey(commandName))
            {
                toReturn = this.commandDictionary[commandName] as T;
            }

            return toReturn;
        }

        /// <summary>
        /// Tries to add a command to the list of known commands.
        /// </summary>
        /// <param name="commandName">Name of the command.</param>
        /// <param name="commandInfo">The command information.</param>
        /// <returns><see langword="true"/> if the new command has been added successfully; otherwise, <see langword="false"/>.</returns>
        /// <remarks>
        /// This method is used by WebDriver implementations to add additional custom driver-specific commands.
        /// This method will not overwrite existing commands for a specific name, and will return <see langword="false"/>
        /// in that case.
        /// </remarks>
        public bool TryAddCommand<T>(string commandName, T commandInfo) where T : CommandInfo
        {
            if (string.IsNullOrEmpty(commandName))
            {
                throw new ArgumentNullException(nameof(commandName), "The name of the command cannot be null or the empty string.");
            }

            if (commandInfo == null)
            {
                throw new ArgumentNullException(nameof(commandInfo), "The command information object cannot be null.");
            }

            if (!typeof(T).IsAssignableFrom(this.RepositoryCommandInfoType))
            {
                string message = string.Format(CultureInfo.InvariantCulture, "{0} is not a valid command type for this repository; command info must be of type {1}", typeof(T), this.RepositoryCommandInfoType);
                throw new ArgumentException(message, nameof(commandInfo));
            }

            if (this.commandDictionary.ContainsKey(commandName))
            {
                return false;
            }

            this.commandDictionary.Add(commandName, commandInfo);
            return true;
        }

        /// <summary>
        /// Initializes the dictionary of commands for the CommandInfoRepository
        /// </summary>
        protected abstract void InitializeCommandDictionary();
    }
}
