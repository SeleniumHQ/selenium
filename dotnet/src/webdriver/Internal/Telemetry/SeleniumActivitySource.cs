// <copyright file="SeleniumActivitySource.cs" company="Selenium Committers">
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

using System.Diagnostics;

namespace OpenQA.Selenium.Internal.Telemetry;

/// <summary>
/// Provides the single, assembly-wide <see cref="ActivitySource"/> used to emit diagnostic activities.
/// </summary>
/// <remarks>
/// Consumers enable this by subscribing to activities from <see cref="Name"/> (e.g. via an
/// <see cref="ActivityListener"/> or an OpenTelemetry <c>AddSource("Selenium.WebDriver")</c> call).
/// </remarks>
internal static class SeleniumActivitySource
{
    internal const string Name = "Selenium.WebDriver";

    internal static readonly ActivitySource Instance = new(Name, ResourceUtilities.ProductVersion);
}
