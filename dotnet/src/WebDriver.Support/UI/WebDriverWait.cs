/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
using System;
using System.Globalization;
using System.Threading;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Provides the ability to wait for an arbitrary condition during test execution.
    /// </summary>
    /// <example>
    /// IWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(3))
    /// IWebElement element = wait.until(driver => driver.FindElement(By.Name("q")));
    /// </example>
    public class WebDriverWait : IWait<IWebDriver>
    {
        private static readonly TimeSpan DefaultSleepTimeout = TimeSpan.FromMilliseconds(500);
    
        private readonly IClock clock;
        private readonly IWebDriver driver;
        private readonly TimeSpan timeout;
        private readonly TimeSpan sleepInterval;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverWait"/> class.
        /// </summary>
        /// <param name="driver">The WebDriver instance used to wait.</param>
        /// <param name="timeout">The timeout value indicating how long to wait for the condition.</param>
        public WebDriverWait(IWebDriver driver, TimeSpan timeout)
            : this(new SystemClock(), driver, timeout, DefaultSleepTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverWait"/> class.
        /// </summary>
        /// <param name="clock">An object implementing the <see cref="IClock"/> interface used to determine when time has passed.</param>
        /// <param name="driver">The WebDriver instance used to wait.</param>
        /// <param name="timeout">The timeout value indicating how long to wait for the condition.</param>
        /// <param name="sleepInterval">A <see cref="TimeSpan"/> value indiciating how often to check for the condition to be true.</param>
        public WebDriverWait(IClock clock, IWebDriver driver, TimeSpan timeout, TimeSpan sleepInterval)
        {
            this.clock = clock;
            this.driver = driver;
            this.timeout = timeout;
            this.sleepInterval = sleepInterval;
        }

        /// <summary>
        /// Waits until a condition is true or times out.
        /// </summary>
        /// <typeparam name="TResult">The type of result to expect from the condition.</typeparam>
        /// <param name="condition">A delegate taking an <see cref="IWebDriver"/> as its parameter, and returning a TResult.</param>
        /// <returns>If TResult is a boolean, the method returns <see langword="true"/> when the condition is true, and <see langword="false"/> otherwise.
        /// If TResult is an object, the method returns the object when the condition evaluates to a value other than <see langword="null"/>.</returns>
        /// <exception cref="ArgumentException">Thrown when TResult is not boolean or an object type.</exception>
        public TResult Until<TResult>(Func<IWebDriver, TResult> condition)
        {
            var resultType = typeof(TResult);
            if ((resultType.IsValueType && resultType != typeof(bool)) || !resultType.IsSubclassOf(typeof(object)))
            {
                throw new ArgumentException("Can only wait on an object or boolean response, tried to use type: " + resultType.ToString(), "condition");
            }

            NotFoundException lastException = null;
            var endTime = this.clock.LaterBy(this.timeout);
            while (this.clock.IsNowBefore(endTime))
            {
                try
                {
                    var result = condition(this.driver);
                    if (resultType == typeof(bool))
                    {
                        var boolResult = result as bool?;
                        if (boolResult.HasValue && boolResult.Value)
                        {
                            return result;
                        }
                    }
                    else
                    {
                        if (result != null)
                        {
                            return result;
                        }
                    }
                }
                catch (NotFoundException e)
                {
                    lastException = e;
                }

                Thread.Sleep(this.sleepInterval);
            }

            throw new TimeoutException(string.Format(CultureInfo.InvariantCulture, "Timed out after {0} seconds", this.timeout.TotalSeconds), lastException);
        }

        /// <summary>
        /// Throws a <see cref="TimeoutException"/> with the given message.
        /// </summary>
        /// <param name="message">The message of the exception.</param>
        /// <param name="lastException">The last exception thrown by the condition.</param>
        protected virtual void ThrowTimeoutException(string message, Exception lastException)
        {
            throw new TimeoutException(message, lastException);
        }
    }
}