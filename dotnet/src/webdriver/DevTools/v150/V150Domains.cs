// <copyright file="V150Domains.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.DevTools.V150;

/// <summary>
/// Class containing the domain implementation for version 150 of the DevTools Protocol.
/// </summary>
public class V150Domains : DevToolsDomains
{
    private readonly DevToolsSessionDomains domains;
    private readonly Lazy<V150Network> network;
    private readonly Lazy<V150JavaScript> javaScript;
    private readonly Lazy<V150Target> target;
    private readonly Lazy<V150Log> log;

    /// <summary>
    /// Initializes a new instance of the V150Domains class.
    /// </summary>
    /// <param name="session">The DevToolsSession to use with this set of domains.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="session"/> is <see langword="null"/>.</exception>
    public V150Domains(DevToolsSession session)
    {
        ArgumentNullException.ThrowIfNull(session);
        this.domains = new DevToolsSessionDomains(session);
        this.network = new Lazy<V150Network>(() => new V150Network(domains.Network, domains.Fetch));
        this.javaScript = new Lazy<V150JavaScript>(() => new V150JavaScript(domains.Runtime, domains.Page));
        this.target = new Lazy<V150Target>(() => new V150Target(domains.Target));
        this.log = new Lazy<V150Log>(() => new V150Log(domains.Log));
    }

    /// <summary>
    /// Gets the DevTools Protocol version for which this class is valid.
    /// </summary>
    public static int DevToolsVersion => 150;

    /// <summary>
    /// Gets the version-specific domains for the DevTools session. This value must be cast to a version specific type to be at all useful.
    /// </summary>
    public override DevTools.DevToolsSessionDomains VersionSpecificDomains => this.domains;

    /// <summary>
    /// Gets the object used for manipulating network information in the browser.
    /// </summary>
    public override DevTools.Network Network => this.network.Value;

    /// <summary>
    /// Gets the object used for manipulating the browser's JavaScript execution.
    /// </summary>
    public override JavaScript JavaScript => this.javaScript.Value;

    /// <summary>
    /// Gets the object used for manipulating DevTools Protocol targets.
    /// </summary>
    public override DevTools.Target Target => this.target.Value;

    /// <summary>
    /// Gets the object used for manipulating the browser's logs.
    /// </summary>
    public override DevTools.Log Log => this.log.Value;
}
