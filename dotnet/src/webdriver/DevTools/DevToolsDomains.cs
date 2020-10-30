// <copyright file="IDomains.cs" company="WebDriver Committers">
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
        // Note carefully that it is sorted in reverse order, most recent
        // version first, as that is more likely to match. When new versions
        // are implemented for support, 
        private static readonly List<Type> SupportedDevToolsVersions = new List<Type>()
        {
            typeof(V86.V86Domains),
            typeof(V85.V85Domains),
            typeof(V84.V84Domains)
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
        /// <param name="versionInfo">The <see cref="DevToolsVersionInfo"/> object containing the browser version information.</param>
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
        public static DevToolsDomains InitializeDomains(DevToolsVersionInfo versionInfo, DevToolsSession session)
        {
            return InitializeDomains(versionInfo, session, DefaultVersionRange);
        }

        /// <summary>
        /// Initializes the supplied DevTools session's domains for the specified browser version within the specified number of versions.
        /// </summary>
        /// <param name="versionInfo">The <see cref="DevToolsVersionInfo"/> object containing the browser version information.</param>
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <param name="versionRange">The range of versions within which to match the provided version number. Defaults to 5 versions.</param>
        /// <returns>The <see cref="DevToolsDomains"/> object containing the version-specific domains.</returns>
        public static DevToolsDomains InitializeDomains(DevToolsVersionInfo versionInfo, DevToolsSession session, int versionRange)
        {
            if (versionRange < 0)
            {
                throw new ArgumentException("Version range must be positive", "versionRange");
            }

            DevToolsDomains domains = null;
            int browserMajorVersion = 0;
            bool versionParsed = int.TryParse(versionInfo.BrowserMajorVersion, out browserMajorVersion);
            if (versionParsed)
            {
                Type domainType = MatchDomainsVersion(browserMajorVersion, versionRange);
                ConstructorInfo constructor = domainType.GetConstructor(new Type[] { typeof(DevToolsSession) });
                if (constructor != null)
                {
                    domains = constructor.Invoke(new object[] { session }) as DevToolsDomains;
                }
            }

            return domains;
        }

        private static Type MatchDomainsVersion(int desiredVersion, int versionRange)
        {
            // Use reflection to look for a DevToolsVersion static field on every known domain implementation type
            foreach (Type candidateType in SupportedDevToolsVersions)
            {
                PropertyInfo info = candidateType.GetProperty("DevToolsVersion", BindingFlags.Static | BindingFlags.Public);
                if (info != null)
                {
                    object propertyValue = info.GetValue(null);
                    if (propertyValue != null)
                    {
                        // Match the version with the desired version within the version range
                        int candidateVersion = (int)propertyValue;
                        if (desiredVersion - candidateVersion < versionRange)
                        {
                            return candidateType;
                        }
                    }
                }
            }

            // TODO: Return a no-op implementation or throw exception.
            return null;
        }
    }
}
