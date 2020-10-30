// <copyright file="CommandResponseTypeMap.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class that maps a DevTools Protocol command's type to the type of object returned by the command.
    /// </summary>
    public class CommandResponseTypeMap
    {
        private readonly IDictionary<Type, Type> commandResponseTypeDictionary = new Dictionary<Type, Type>();

        /// <summary>
        /// Adds mapping to a response type for a specified command type.
        /// </summary>
        /// <param name="commandSettingsType">The type of command to add the mapping for.</param>
        /// <param name="commandResponseType">The type of response object corresponding to the command.</param>
        public void AddCommandResponseType(Type commandSettingsType, Type commandResponseType)
        {
            if (!commandResponseTypeDictionary.ContainsKey(commandSettingsType))
            {
                commandResponseTypeDictionary.Add(commandSettingsType, commandResponseType);
            }
        }

        /// <summary>
        /// Gets the command response type corresponding to the specified command type.
        /// </summary>
        /// <typeparam name="T">The type of command for which to retrieve the response type.</typeparam>
        /// <param name="commandResponseType">The returned response type.</param>
        /// <returns><see langword="true"/> if the specified command type has a mapped response type; otherwise, <see langword="false"/>.</returns>
        public bool TryGetCommandResponseType<T>(out Type commandResponseType)
            where T : ICommand
        {
            return commandResponseTypeDictionary.TryGetValue(typeof(T), out commandResponseType);
        }
    }
}
