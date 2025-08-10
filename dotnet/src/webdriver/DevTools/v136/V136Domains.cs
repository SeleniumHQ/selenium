// <copyright file="V136Domains.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.DevTools.V136;

/// <summary>
/// Class containing the domain implementation for version 136 of the DevTools Protocol.
/// </summary>
public class V136Domains : DevToolsDomains
{
    private readonly DevToolsSessionDomains domains;

    /// <summary>
    /// Initializes a new instance of the V136Domains class.
    /// </summary>
    /// <param name="session">The DevToolsSession to use with this set of domains.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="session"/> is <see langword="null"/>.</exception>
    public V136Domains(DevToolsSession session)
    {
        this.domains = new DevToolsSessionDomains(session ?? throw new ArgumentNullException(nameof(session)));
    }

    /// <summary>
    /// Gets the DevTools Protocol version for which this class is valid.
    /// </summary>
    public static int DevToolsVersion => 136;

    /// <summary>
    /// Gets the version-specific domains for the DevTools session. This value must be cast to a version specific type to be at all useful.
    /// </summary>
    public override DevTools.DevToolsSessionDomains VersionSpecificDomains => this.domains;

    /// <summary>
    /// Gets the object used for manipulating network information in the browser.
    /// </summary>
    public override DevTools.Network Network => new V136Network(domains.Network, domains.Fetch);

    /// <summary>
    /// Gets the object used for manipulating the browser's JavaScript execution.
    /// </summary>
    public override JavaScript JavaScript => new V136JavaScript(domains.Runtime, domains.Page);

    /// <summary>
    /// Gets the object used for manipulating DevTools Protocol targets.
    /// </summary>
    public override DevTools.Target Target => new V136Target(domains.Target);

    /// <summary>
    /// Gets the object used for manipulating the browser's logs.
    /// </summary>
    public override DevTools.Log Log => new V136Log(domains.Log);
}
