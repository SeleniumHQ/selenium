using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Core;
using OpenQA.Selenium.Environment;
using System.Reflection;

namespace OpenQA.Selenium
{
    public class WebDriverTestMethod : NUnitTestMethod
    {
        private bool needsDriverBefore = false;
        private bool needsDriverAfter = false;

        public WebDriverTestMethod(NUnitTestMethod method, bool needsNewDriverBeforeTest, bool needsNewDriverAfterTest)
            : base(method.Method)
        {
            this.needsDriverBefore = needsNewDriverBeforeTest;
            this.needsDriverAfter = needsNewDriverAfterTest;
            this.ExceptionProcessor = method.ExceptionProcessor;
        }

        public override TestResult Run(EventListener listener, ITestFilter filter)
        {
            DriverTestFixture fixtureInstance = base.Parent.Fixture as DriverTestFixture;
            if (fixtureInstance != null && needsDriverBefore)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }

            TestResult result = base.Run(listener, filter);

            if (fixtureInstance != null && needsDriverAfter)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }

            return result;
        }
    }
}
