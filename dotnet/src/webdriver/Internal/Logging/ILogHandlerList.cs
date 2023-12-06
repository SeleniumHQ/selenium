// <copyright file="ILogHandlerList.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a list of log handlers.
    /// </summary>
    public interface ILogHandlerList : IEnumerable<ILogHandler>
    {
        /// <summary>
        /// Adds a log handler to the list.
        /// </summary>
        /// <param name="handler">The log handler to add.</param>
        /// <returns>The log context.</returns>
        ILogContext Add(ILogHandler handler);

        /// <summary>
        /// Removes a log handler from the list.
        /// </summary>
        /// <param name="handler">The log handler to remove.</param>
        /// <returns>The log context.</returns>
        ILogContext Remove(ILogHandler handler);

        /// <summary>
        /// Clears all log handlers from the list.
        /// </summary>
        /// <returns>The log context.</returns>
        ILogContext Clear();
    }
}
