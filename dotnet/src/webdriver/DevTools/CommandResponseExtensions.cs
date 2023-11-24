// <copyright file="CommandResponseExtensions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Provides extension methods for command responses.
    /// </summary>
    public static class ICommandResponseExtensions
    {
        /// <summary>
        /// Returns the strongly-typed response for an object impelementing the <see cref="ICommandResponse"/> interface.
        /// </summary>
        /// <typeparam name="TCommandResponse">The concrete implementation type of command response expected.</typeparam>
        /// <param name="response">The <see cref="ICommandResponse"/> object to convert to the implementation type</param>
        /// <returns>The concrete implementation of the command response.</returns>
        public static TCommandResponse GetResponse<TCommandResponse>(this ICommandResponse response)
            where TCommandResponse : class, ICommandResponse
        {
            return response as TCommandResponse;
        }
    }
}
