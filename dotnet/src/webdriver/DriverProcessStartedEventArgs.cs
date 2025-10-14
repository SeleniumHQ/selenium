// <copyright file="DriverProcessStartedEventArgs.cs" company="Selenium Committers">
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
using System.Diagnostics;

namespace OpenQA.Selenium;

/// <summary>
/// Provides data for the DriverProcessStarted event of a <see cref="DriverService"/> object.
/// </summary>
public class DriverProcessStartedEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="DriverProcessStartingEventArgs"/> class.
    /// </summary>
    /// <param name="driverProcess">The <see cref="Process"/> object started.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="driverProcess"/> is <see langword="null"/>.</exception>
    public DriverProcessStartedEventArgs(Process driverProcess)
    {
        if (driverProcess is null)
        {
            throw new ArgumentNullException(nameof(driverProcess));
        }

        this.ProcessId = driverProcess.Id;
    }

    /// <summary>
    /// Gets the unique ID of the driver executable process.
    /// </summary>
    public int ProcessId { get; }
}
