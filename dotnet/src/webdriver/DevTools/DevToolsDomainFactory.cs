using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
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

        public static IDomains InitializeDomains(DevToolsVersionInfo versionInfo, DevToolsSession session)
        {
            return InitializeDomains(versionInfo, session, DefaultVersionRange);
        }

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
