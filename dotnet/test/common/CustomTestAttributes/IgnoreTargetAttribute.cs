using NUnit.Framework;
using NUnit.Framework.Interfaces;
using System;
using NUnit.Framework.Internal;
using System.Collections.Generic;
using OpenQA.Selenium.Environment;


namespace OpenQA.Selenium
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class IgnoreTargetAttribute : NUnitAttribute, IApplyToTest
    {
        private readonly String target;
        private readonly string ignoreReason = string.Empty;

        public IgnoreTargetAttribute(string target)
        {
            this.target = target.ToLower();
        }

        public IgnoreTargetAttribute(string target, string reason)
            : this(target)
        {
            this.ignoreReason = reason;
        }

        public string Value
        {
            get { return target; }
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
                        test.TypeInfo.GetCustomAttributes<IgnoreTargetAttribute>(true);
                    if (ignoreClassAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreClassAttributes);
                    }
                }
                else
                {
                    IgnoreTargetAttribute[] ignoreMethodAttributes =
                        test.Method.GetCustomAttributes<IgnoreTargetAttribute>(true);
                    if (ignoreMethodAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreMethodAttributes);
                    }
                }

                foreach (Attribute attr in ignoreAttributes)
                {
                    IgnoreTargetAttribute platformToIgnoreAttr = attr as IgnoreTargetAttribute;
                    if (platformToIgnoreAttr != null && IgnoreTestForPlatform(platformToIgnoreAttr.Value))
                    {
                        string ignoreReason =
                            "Ignoring target " + EnvironmentManager.Instance.Browser.ToString() + ".";
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
#if NET6_0
            return "net6";
#endif
#if NET48
            return "net48";
#endif
            return null;
        }
    }
}
