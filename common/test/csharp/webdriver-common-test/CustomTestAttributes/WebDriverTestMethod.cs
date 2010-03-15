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

            this.ExceptionExpected = method.ExceptionExpected;
            this.ExceptionHandler = method.ExceptionHandler;
            this.ExpectedExceptionName = method.ExpectedExceptionName;
            this.ExpectedExceptionType = method.ExpectedExceptionType;
            this.ExpectedMessage = method.ExpectedMessage;
        }

        public override void Run(TestCaseResult testResult)
        {
            DriverTestFixture fixtureInstance = base.Parent.Fixture as DriverTestFixture;
            if (fixtureInstance != null)
            {
                if (needsDriverBefore)
                {
                    EnvironmentManager.Instance.CreateFreshDriver();
                    fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
                }

                base.Run(testResult);

                if (needsDriverAfter)
                {
                    EnvironmentManager.Instance.CreateFreshDriver();
                    fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
                }
            }
        }
    }
}
