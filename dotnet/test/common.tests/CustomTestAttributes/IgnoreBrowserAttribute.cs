using NUnit.Framework;
using NUnit.Framework.Interfaces;
using System;
using NUnit.Framework.Internal;
using System.Collections.Generic;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class IgnoreBrowserAttribute : NUnitAttribute, IApplyToTest
    {
        private Browser browser;
        private string ignoreReason = string.Empty;

        public IgnoreBrowserAttribute(Browser browser)
        {
            this.browser = browser;
        }

        public IgnoreBrowserAttribute(Browser browser, string reason)
            : this(browser)
        {
            ignoreReason = reason;
        }
        
        public Browser Value
        {
            get { return browser; }
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
                    Attribute[] ignoreClassAttributes = test.TypeInfo.GetCustomAttributes<IgnoreBrowserAttribute>(true);
                    if (ignoreClassAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreClassAttributes);
                    }
                }
                else
                {
                    IgnoreBrowserAttribute[] ignoreMethodAttributes = test.Method.GetCustomAttributes<IgnoreBrowserAttribute>(true);
                    if (ignoreMethodAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreMethodAttributes);
                    }
                }

                foreach (Attribute attr in ignoreAttributes)
                {
                    IgnoreBrowserAttribute browserToIgnoreAttr = attr as IgnoreBrowserAttribute;
                    if (browserToIgnoreAttr != null && IgnoreTestForBrowser(browserToIgnoreAttr.Value))
                    {
                        string ignoreReason = "Ignoring browser " + EnvironmentManager.Instance.Browser.ToString() + ".";
                        if (!string.IsNullOrEmpty(browserToIgnoreAttr.Reason))
                        {
                            ignoreReason = ignoreReason + " " + browserToIgnoreAttr.Reason;
                        }

                        test.RunState = RunState.Ignored;
                        test.Properties.Set(PropertyNames.SkipReason, browserToIgnoreAttr.Reason);
                    }
                }
            }
        }

        private bool IgnoreTestForBrowser(Browser browserToIgnore)
        {
            return browserToIgnore.Equals(EnvironmentManager.Instance.Browser) || browserToIgnore.Equals(Browser.All) || IsRemoteInstanceOfBrowser(browserToIgnore);
        }

        private bool IsRemoteInstanceOfBrowser(Browser desiredBrowser)
        {
            bool isRemoteInstance = false;
            switch (desiredBrowser)
            {
                case Browser.IE:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "internet explorer")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.Firefox:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "firefox")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.HtmlUnit:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "htmlunit")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.Chrome:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "chrome")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.IPhone:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "iphone")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.Android:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "android")
                    {
                        isRemoteInstance = true;
                    }
                    break;
            }
            return isRemoteInstance;
        }
    }
}
