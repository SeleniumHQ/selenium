// <copyright file="DriverTestFixture.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium.Tests.Infrastructure.Environment;
using static NUnit.Framework.Interfaces.ResultState;

namespace OpenQA.Selenium.Tests;

public abstract class DriverTestFixture
{
    protected static UrlBuilder Urls => EnvironmentManager.Instance.WebServer.Urls;

    protected internal IWebDriver Driver { get; set; }

    public bool IsNativeEventsEnabled
    {
        get
        {
            if (Driver is IHasCapabilities capabilitiesDriver &&
                capabilitiesDriver.Capabilities.HasCapability(CapabilityType.HasNativeEvents) &&
                (bool)capabilitiesDriver.Capabilities.GetCapability(CapabilityType.HasNativeEvents))
            {
                return true;
            }

            return false;
        }
    }

    [OneTimeSetUp]
    public void SetUp()
    {
        Driver = EnvironmentManager.Instance.GetCurrentDriver();
    }

    [OneTimeTearDown]
    public void TearDown()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        Driver?.Dispose();
    }

    [TearDown]
    public void ResetOnError()
    {
        if (TestContext.CurrentContext.Result.Outcome == Error)
        {
            Driver?.Dispose();
            Driver = EnvironmentManager.Instance.CreateFreshDriver();
        }
    }

    /// <summary>
    /// Exists because a given test might require a fresh driver.
    /// </summary>
    protected void CreateFreshDriver()
    {
        Driver = EnvironmentManager.Instance.CreateFreshDriver();
    }

    protected void WaitFor(Func<bool> waitFunction, string timeoutMessage)
    {
        WaitFor<bool>(waitFunction, timeoutMessage);
    }

    protected T WaitFor<T>(Func<T> waitFunction, string timeoutMessage)
    {
        return WaitFor(waitFunction, TimeSpan.FromSeconds(5), timeoutMessage);
    }

    protected T WaitFor<T>(Func<T> waitFunction, TimeSpan timeout, string timeoutMessage)
    {
        var waiter = new WebDriverWait(Driver, timeout)
        {
            PollingInterval = TimeSpan.FromMilliseconds(100),
            Message = $"Condition timed out: {timeoutMessage}",
        };

        waiter.IgnoreExceptionTypes(typeof(Exception));

        return waiter.Until((driver) =>
        {
            return waitFunction();
        });
    }
}
