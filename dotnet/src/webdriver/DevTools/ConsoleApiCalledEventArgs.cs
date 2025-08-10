// <copyright file="ConsoleApiCalledEventArgs.cs" company="Selenium Committers">
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
// </copyright>

using System;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.DevTools;

/// <summary>
/// Event arguments present when the ConsoleApiCalled event is raised.
/// </summary>
public class ConsoleApiCalledEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ConsoleApiCalledEventArgs"/> type.
    /// </summary>
    /// <param name="timestamp">The time stamp when the browser's console API is called.</param>
    /// <param name="type">The type of message when the browser's console API is called.</param>
    /// <param name="arguments">The arguments of the call to the browser's console API.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="arguments"/> is <see langword="null"/>.</exception>
    public ConsoleApiCalledEventArgs(DateTime timestamp, string type, ReadOnlyCollection<ConsoleApiArgument> arguments)
    {
        Timestamp = timestamp;
        Type = type;
        Arguments = arguments ?? throw new ArgumentNullException(nameof(arguments));
    }

    /// <summary>
    /// Gets the time stamp when the browser's console API is called.
    /// </summary>
    public DateTime Timestamp { get; }

    /// <summary>
    /// Gets the type of message when the browser's console API is called.
    /// </summary>
    public string Type { get; }

    /// <summary>
    /// Gets the arguments of the call to the browser's console API.
    /// </summary>
    public ReadOnlyCollection<ConsoleApiArgument> Arguments { get; }
}
