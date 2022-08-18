// <copyright file="DevToolsDomains.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Interface providing version-independent implementations of operations available using the DevTools Protocol.
    /// </summary>
    public abstract class DevToolsDomains
    {
        // By default, we will look for a supported version within this
        // number of versions, as that will most likely still work.
        private static readonly int DefaultVersionRange = 5;

        // This is the list of known supported DevTools version implementation.
        // When new versions are implemented for support, new types must be
        // added to this dictionary.
        private static readonly Dictionary<int, Type> SupportedDevToolsVersions = new Dictionary<int, Type>()
        {
            { 104, typeof(V104.V104Domains) },
            { 103, typeof(V103.V103Domains) },
            { 102, typeof(V102.V102Domains) },
            { 85, typeof(V85.V85Domains) }
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
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
        public static DevToolsDomains InitializeDomains(int protocolVersion, DevToolsSession session)
        {
            return InitializeDomains(protocolVersion, session, DefaultVersionRange);
        }

        /// <summary>
        /// Initializes the supplied DevTools session's domains for the specified browser version within the specified number of versions.
        /// </summary>
        /// <param name="protocolVersion">The version of the DevTools Protocol to use.</param>
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <param name="versionRange">The range of versions within which to match the provided version number. Defaults to 5 versions.</param>
        /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
        public static DevToolsDomains InitializeDomains(int protocolVersion, DevToolsSession session, int versionRange)
        {
            if (versionRange < 0)
            {
                throw new ArgumentException("Version range must be positive", nameof(versionRange));
            }

            DevToolsDomains domains = null;
            Type domainType = MatchDomainsVersion(protocolVersion, versionRange);
            ConstructorInfo constructor = domainType.GetConstructor(new Type[] { typeof(DevToolsSession) });
            if (constructor != null)
            {
                domains = constructor.Invoke(new object[] { session }) as DevToolsDomains;
            }

            return domains;
        }

        private static Type MatchDomainsVersion(int desiredVersion, int versionRange)
        {
            // Return fast on an exact match
            if (SupportedDevToolsVersions.ContainsKey(desiredVersion))
            {
                return SupportedDevToolsVersions[desiredVersion];
            }

            // Get the list of supported versions and sort descending
            List<int> supportedVersions = new List<int>(SupportedDevToolsVersions.Keys);
            supportedVersions.Sort((first, second) => second.CompareTo(first));

            foreach (int supportedVersion in supportedVersions)
            {
                // Match the version with the desired version within the
                // version range, using "The Price Is Right" style matching
                // (that is, closest without going over).
                if (desiredVersion >= supportedVersion && desiredVersion - supportedVersion < versionRange)
                {
                    return SupportedDevToolsVersions[supportedVersion];
                }
            }

            // TODO: Return a no-op implementation or throw exception.
            return null;
        }
    }
}
