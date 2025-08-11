// <copyright file="ChromiumDriverLogLevel.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Chromium;

/// <summary>
/// Represents the valid values of logging levels available with the Chromium based drivers.
/// </summary>
public enum ChromiumDriverLogLevel
{
    /// <summary>
    /// Represents the value All, the most detailed logging level available.
    /// </summary>
    All,

    /// <summary>
    /// Represents the Debug value
    /// </summary>
    Debug,

    /// <summary>
    /// Represents the Info value
    /// </summary>
    Info,

    /// <summary>
    /// Represents the Warning value
    /// </summary>
    Warning ,

    /// <summary>
    /// Represents the Severe value
    /// </summary>
    Severe,

    /// <summary>
    /// Represents the Off value, nothing gets logged
    /// </summary>
    Off,

    /// <summary>
    /// Represents that the logging value is unspecified, and should be the default level.
    /// </summary>
    Default
}
