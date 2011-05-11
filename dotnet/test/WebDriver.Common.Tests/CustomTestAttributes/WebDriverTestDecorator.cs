using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using NUnit.Core;
using NUnit.Core.Extensibility;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [NUnitAddin(Description = "Manages execution of WebDriver tests, including ignoring browsers and launching new IWebDriver instances.")]
    public class WebDriverTestDecorator : ITestDecorator, IAddin
    {
        private static readonly string NeedsFreshDriverAttributeTypeFullName = typeof(NeedsFreshDriverAttribute).FullName;
        private static readonly string IgnoreBrowserAttributeTypeFullName = typeof(IgnoreBrowserAttribute).FullName;

        #region IAddin Members

        public bool Install(IExtensionHost host)
        {
            IExtensionPoint decorators = host.GetExtensionPoint("TestDecorators");
            if (decorators == null)
                return false;

            decorators.Install(this);
            return true;
        }

        #endregion

        #region ITestDecorator Members

        public Test Decorate(Test test, MemberInfo member)
        {
            NUnitTestMethod testMethod = test as NUnitTestMethod;
            
            if (testMethod != null && testMethod.RunState == RunState.Runnable)
            {
                Attribute[] ignoreAttr = Reflect.GetAttributes(member, IgnoreBrowserAttributeTypeFullName, true);
                if (ignoreAttr != null)
                {
                    foreach (Attribute attr in ignoreAttr)
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
                            test.IgnoreReason = ignoreReason;
                        }
                    }
                }

                if (test.RunState == RunState.Runnable)
                {
                    NeedsFreshDriverAttribute needsDriverAttr = Reflect.GetAttribute(member, NeedsFreshDriverAttributeTypeFullName, false) as NeedsFreshDriverAttribute;
                    if (needsDriverAttr != null)
                    {
                        test = new WebDriverTestMethod(testMethod, needsDriverAttr.BeforeTest, needsDriverAttr.AfterTest);
                    }
                }
            }

            return test;
        }

        #endregion

        private bool IgnoreTestForBrowser(Browser browserToIgnore)
        {
            return browserToIgnore.Equals(EnvironmentManager.Instance.Browser) || browserToIgnore.Equals(Browser.All) || IsRemoteInstanceOfBrowser(browserToIgnore);
        }

        private bool IgnoreTestForBrowser(Test test, MemberInfo member)
        {
            bool ignoreTest = false;
            Attribute[] ignoreAttr = Reflect.GetAttributes(member, IgnoreBrowserAttributeTypeFullName, true);

            if (member != null && ignoreAttr != null)
            {
                // A test case might be ignored in more than one browser
                foreach (System.Attribute attr in ignoreAttr)
                {
                    object propVal = Reflect.GetPropertyValue(attr, "Value", BindingFlags.Public | BindingFlags.Instance);
                    object reasonValue = Reflect.GetPropertyValue(attr, "Reason", BindingFlags.Public | BindingFlags.Instance);

                    if (propVal != null)
                    {
                        string ignoreReason = "Ignoring browser " + EnvironmentManager.Instance.Browser.ToString() + ".";
                        if (reasonValue != null)
                        {
                            ignoreReason = ignoreReason + " " + reasonValue.ToString();
                        }

                        Browser browser = (Browser)propVal;
                        if (browser.Equals(EnvironmentManager.Instance.Browser) || browser.Equals(Browser.All) || IsRemoteInstanceOfBrowser(browser))
                        {
                            ignoreTest = true;
                        }
                    }

                }
            }

            return ignoreTest;
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
