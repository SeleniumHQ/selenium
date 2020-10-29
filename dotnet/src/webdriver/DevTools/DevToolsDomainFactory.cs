// <copyright file="DevToolsomainFactory.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Factory class used to create the set of DevTools Protocol domains specific to the specified version of the browser.
    /// </summary>
    public static class DevToolsDomainFactory
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
        /// Initializes the supplied DevTools session's domains for the specified browser version.
        /// </summary>
        /// <param name="versionInfo">The <see cref="DevToolsVersionInfo"/> object containing the browser version information.</param>
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <returns>The <see cref="IDomains"/> object containing the version-specific domains.</returns>
        public static IDomains InitializeDomains(DevToolsVersionInfo versionInfo, DevToolsSession session)
        {
            return InitializeDomains(versionInfo, session, DefaultVersionRange);
        }


        /// <summary>
        /// Initializes the supplied DevTools session's domains for the specified browser version within the specified number of versions.
        /// </summary>
        /// <param name="versionInfo">The <see cref="DevToolsVersionInfo"/> object containing the browser version information.</param>
        /// <param name="session">The <see cref="DevToolsSession"/> for which to initialiize the domains.</param>
        /// <param name="versionRange">The range of versions within which to match the provided version number. Defaults to 5 versions.</param>
        /// <returns>The <see cref="IDomains"/> object containing the version-specific domains.</returns>
        public static IDomains InitializeDomains(DevToolsVersionInfo versionInfo, DevToolsSession session, int versionRange)
        {
            if (versionRange < 0)
            {
                throw new ArgumentException("Version range must be positive", "versionRange");
            }

            IDomains domains = null;
            int browserMajorVersion = 0;
            bool versionParsed = int.TryParse(versionInfo.BrowserMajorVersion, out browserMajorVersion);
            if (versionParsed)
            {
                Type domainType = MatchDomainsVersion(browserMajorVersion, versionRange);
                ConstructorInfo constructor = domainType.GetConstructor(new Type[] { typeof(DevToolsSession) });
                if (constructor != null)
                {
                    domains = constructor.Invoke(new object[] { session }) as IDomains;
                }
            }

            return domains;
        }

        private static Type MatchDomainsVersion(int desiredVersion, int versionRange)
        {
            // Use reflection to look for a DevToolsVersion static field on every known domain implementation type
            foreach (Type candidateType in SupportedDevToolsVersions)
            {
                FieldInfo info = candidateType.GetField("DevToolsVersion", BindingFlags.Static | BindingFlags.Public);
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
