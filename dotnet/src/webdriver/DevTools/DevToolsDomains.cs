// <copyright file="DevToolsDomains.cs" company="Selenium Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium.DevTools;

/// <summary>
/// Interface providing version-independent implementations of operations available using the DevTools Protocol.
/// </summary>
public abstract class DevToolsDomains
{
    // By default, we will look for a supported version within this
    // number of versions, as that will most likely still work.
    private const int DefaultVersionRange = 5;

    // This is the list of known supported DevTools version implementation.
    // When new versions are implemented for support, new types must be
    // added to this array and to the method below.
    private static int[] SupportedDevToolsVersions =>
    [
        139,
        138,
        137,
    ];

    private static DevToolsDomains? CreateDevToolsDomain(int protocolVersion, DevToolsSession session) => protocolVersion switch
    {
        139 => new V139.V139Domains(session),
        138 => new V138.V138Domains(session),
        137 => new V137.V137Domains(session),
        _ => null
    };

    /// <summary>
    /// Gets the version-specific domains for the DevTools session. This value must be cast to a version specific type to be at all useful.
    /// </summary>
    public abstract DevToolsSessionDomains VersionSpecificDomains { get; }

    /// <summary>
    /// Gets the object used for manipulating network information in the browser.
    /// </summary>
    public abstract Network Network { get; }

    /// <summary>
    /// Gets the object used for manipulating the browser's JavaScript execution.
    /// </summary>
    public abstract JavaScript JavaScript { get; }

    /// <summary>
    /// Gets the object used for manipulating DevTools Protocol targets.
    /// </summary>
    public abstract Target Target { get; }

    /// <summary>
    /// Gets the object used for manipulating the browser's logs.
    /// </summary>
    public abstract Log Log { get; }

    /// <summary>
    /// Initializes the supplied DevTools session's domains for the specified browser version.
    /// </summary>
    /// <param name="protocolVersion">The version of the DevTools Protocol to use.</param>
    /// <param name="session">The <see cref="DevToolsSession"/> for which to initialize the domains.</param>
    /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
    /// <exception cref="ArgumentException">If <paramref name="protocolVersion"/> is negative.</exception>
    /// <exception cref="WebDriverException">If the desired protocol version is not supported.</exception>
    public static DevToolsDomains InitializeDomains(int protocolVersion, DevToolsSession session)
    {
        return InitializeDomains(protocolVersion, session, DefaultVersionRange);
    }

    /// <summary>
    /// Initializes the supplied DevTools session's domains for the specified browser version within the specified number of versions.
    /// </summary>
    /// <param name="protocolVersion">The version of the DevTools Protocol to use.</param>
    /// <param name="session">The <see cref="DevToolsSession"/> for which to initialize the domains.</param>
    /// <param name="versionRange">The range of versions within which to match the provided version number. Defaults to 5 versions.</param>
    /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
    /// <exception cref="ArgumentException">If <paramref name="protocolVersion"/> is negative.</exception>
    /// <exception cref="WebDriverException">If the desired protocol version is not in the supported range.</exception>
    public static DevToolsDomains InitializeDomains(int protocolVersion, DevToolsSession session, int versionRange)
    {
        if (versionRange < 0)
        {
            throw new ArgumentException("Version range must be positive", nameof(versionRange));
        }

        // Return fast on an exact match
        DevToolsDomains? domains = CreateDevToolsDomain(protocolVersion, session);
        if (domains is not null)
        {
            return domains;
        }

        return CreateFallbackDomain(protocolVersion, session, versionRange);
    }

    private static DevToolsDomains CreateFallbackDomain(int desiredVersion, DevToolsSession session, int versionRange)
    {
        // Get the list of supported versions and sort descending
        List<int> supportedVersions = new List<int>(SupportedDevToolsVersions);
        supportedVersions.Sort((first, second) => second.CompareTo(first));

        foreach (int supportedVersion in supportedVersions)
        {
            // Match the version with the desired version within the
            // version range, using "The Price Is Right" style matching
            // (that is, closest without going over).
            if (desiredVersion >= supportedVersion && desiredVersion - supportedVersion < versionRange)
            {
                return CreateDevToolsDomain(supportedVersion, session)!;
            }
        }

        throw new WebDriverException($"DevTools version is not in the supported range. Desired version={desiredVersion}, range={versionRange}. Supported versions: {string.Join(", ", supportedVersions)}");
    }
}
