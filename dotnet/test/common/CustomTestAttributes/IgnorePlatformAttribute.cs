using NUnit.Framework;
using NUnit.Framework.Interfaces;
using System;
using NUnit.Framework.Internal;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using OpenQA.Selenium.Environment;

#if !NET45 && !NET46 && !NET47
using System.Runtime.InteropServices;
using OSPlatform = System.Runtime.InteropServices.OSPlatform;
#endif


namespace OpenQA.Selenium
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class IgnorePlatformAttribute : NUnitAttribute, IApplyToTest
    {
        private readonly String platform;
        private readonly string ignoreReason = string.Empty;

        public IgnorePlatformAttribute(string platform)
        {
            this.platform = platform.ToLower();
        }

        public IgnorePlatformAttribute(string platform, string reason)
            : this(platform)
        {
            this.ignoreReason = reason;
        }

        public string Value
        {
            get { return platform; }
        }

        public string Reason
        {
            get { return ignoreReason; }
        }

        public void ApplyToTest(Test test)
        {
            if (test.RunState != RunState.NotRunnable)
            {
                List<Attribute> ignoreAttributes = new List<Attribute>();
                if (test.IsSuite)
                {
                    Attribute[] ignoreClassAttributes =
                        test.TypeInfo.GetCustomAttributes<IgnorePlatformAttribute>(true);
                    if (ignoreClassAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreClassAttributes);
                    }
                }
                else
                {
                    IgnorePlatformAttribute[] ignoreMethodAttributes =
                        test.Method.GetCustomAttributes<IgnorePlatformAttribute>(true);
                    if (ignoreMethodAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreMethodAttributes);
                    }
                }

                foreach (Attribute attr in ignoreAttributes)
                {
                    IgnorePlatformAttribute platformToIgnoreAttr = attr as IgnorePlatformAttribute;
                    if (platformToIgnoreAttr != null && IgnoreTestForPlatform(platformToIgnoreAttr.Value))
                    {
                        string ignoreReason =
                            "Ignoring platform " + EnvironmentManager.Instance.Browser.ToString() + ".";
                        if (!string.IsNullOrEmpty(platformToIgnoreAttr.Reason))
                        {
                            ignoreReason = ignoreReason + " " + platformToIgnoreAttr.Reason;
                        }

                        test.RunState = RunState.Ignored;
                        test.Properties.Set(PropertyNames.SkipReason, platformToIgnoreAttr.Reason);
                    }
                }
            }
        }

        private bool IgnoreTestForPlatform(string platformToIgnore)
        {
            return CurrentPlatform() != null && platformToIgnore.Equals(CurrentPlatform());
        }

        private string CurrentPlatform()
        {
#if NET45 || NET46 || NET47
            return null;
#else
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return "windows";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return "linux";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                return "mac";
            }
            else
            {
                throw new WebDriverException("Selenium Manager did not find supported operating system");
            }
#endif
        }
    }
}
