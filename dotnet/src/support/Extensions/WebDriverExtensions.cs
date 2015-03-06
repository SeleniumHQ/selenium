﻿// <copyright file="WebDriverExtensions.cs" company="WebDriver Committers">
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Linq;
using System.Reflection;
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Support.Extensions
{
    /// <summary>
    /// Provides extension methods for convenience in using WebDriver.
    /// </summary>
    public static class WebDriverExtensions
    {
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <param name="driver">The driver instance to extend.</param>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        /// <exception cref="WebDriverException">Thrown if this <see cref="IWebDriver"/> instance
        /// does not implement <see cref="ITakesScreenshot"/>, or the capabilities of the driver
        /// indicate that it cannot take screenshots.</exception>
        public static Screenshot TakeScreenshot(this IWebDriver driver)
        {
            ITakesScreenshot screenshotDriver = driver as ITakesScreenshot;
            if (screenshotDriver == null)
            {
                IHasCapabilities capabilitiesDriver = driver as IHasCapabilities;
                if (capabilitiesDriver == null)
                {
                    throw new WebDriverException("Driver does not implement ITakesScreenshot or IHasCapabilities");
                }

                if (!capabilitiesDriver.Capabilities.HasCapability(CapabilityType.TakesScreenshot) || !(bool)capabilitiesDriver.Capabilities.GetCapability(CapabilityType.TakesScreenshot))
                {
                    throw new WebDriverException("Driver capabilities do not support taking screenshots");
                }

                MethodInfo executeMethod = driver.GetType().GetMethod("Execute", BindingFlags.Instance | BindingFlags.NonPublic);
                Response screenshotResponse = executeMethod.Invoke(driver, new object[] { DriverCommand.Screenshot, null }) as Response;
                if (screenshotResponse == null)
                {
                    throw new WebDriverException("Unexpected failure getting screenshot; response was not in the proper format.");
                }

                string screenshotResult = screenshotResponse.Value.ToString();
                return new Screenshot(screenshotResult);
            }

            return screenshotDriver.GetScreenshot();
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window
        /// </summary>
        /// <typeparam name="T">Expected return type of the JavaScript execution.</typeparam>
        /// <param name="driver">The driver instance to extend.</param>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        /// <exception cref="WebDriverException">Thrown if this <see cref="IWebDriver"/> instance
        /// does not implement <see cref="IJavaScriptExecutor"/>, or if the actual return type
        /// of the JavaScript execution does not match the expected type.</exception>
        public static T ExecuteJavaScript<T>(this IWebDriver driver, string script, params object[] args)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                throw new WebDriverException("Driver does not implement IJavaScriptExecutor");
            }

            object result = executor.ExecuteScript(script, args);
            if (!result.GetType().IsAssignableFrom(typeof(T)))
            {
                throw new WebDriverException("Script returned a value, but the result could not be cast to the desired type");
            }

            return (T)result;
        }
    }
}
