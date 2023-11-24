// <copyright file="DefaultWait{T}.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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
using System.Globalization;
using System.Linq;
using System.Threading;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// An implementation of the <see cref="IWait&lt;T&gt;"/> interface that may have its timeout and polling interval
    /// configured on the fly.
    /// </summary>
    /// <typeparam name="T">The type of object on which the wait it to be applied.</typeparam>
    public class DefaultWait<T> : IWait<T>
    {
        private T input;
        private IClock clock;

        private TimeSpan timeout = DefaultSleepTimeout;
        private TimeSpan sleepInterval = DefaultSleepTimeout;
        private string message = string.Empty;

        private List<Type> ignoredExceptions = new List<Type>();

        /// <summary>
        /// Initializes a new instance of the <see cref="DefaultWait&lt;T&gt;"/> class.
        /// </summary>
        /// <param name="input">The input value to pass to the evaluated conditions.</param>
        public DefaultWait(T input)
            : this(input, new SystemClock())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DefaultWait&lt;T&gt;"/> class.
        /// </summary>
        /// <param name="input">The input value to pass to the evaluated conditions.</param>
        /// <param name="clock">The clock to use when measuring the timeout.</param>
        public DefaultWait(T input, IClock clock)
        {
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input), "input cannot be null");
            }

            if (clock == null)
            {
                throw new ArgumentNullException(nameof(clock), "clock cannot be null");
            }

            this.input = input;
            this.clock = clock;
        }

        /// <summary>
        /// Gets or sets how long to wait for the evaluated condition to be true. The default timeout is 500 milliseconds.
        /// </summary>
        public TimeSpan Timeout
        {
            get { return this.timeout; }
            set { this.timeout = value; }
        }

        /// <summary>
        /// Gets or sets how often the condition should be evaluated. The default timeout is 500 milliseconds.
        /// </summary>
        public TimeSpan PollingInterval
        {
            get { return this.sleepInterval; }
            set { this.sleepInterval = value; }
        }

        /// <summary>
        /// Gets or sets the message to be displayed when time expires.
        /// </summary>
        public string Message
        {
            get { return this.message; }
            set { this.message = value; }
        }

        private static TimeSpan DefaultSleepTimeout
        {
            get { return TimeSpan.FromMilliseconds(500); }
        }

        /// <summary>
        /// Configures this instance to ignore specific types of exceptions while waiting for a condition.
        /// Any exceptions not whitelisted will be allowed to propagate, terminating the wait.
        /// </summary>
        /// <param name="exceptionTypes">The types of exceptions to ignore.</param>
        public void IgnoreExceptionTypes(params Type[] exceptionTypes)
        {
            if (exceptionTypes == null)
            {
                throw new ArgumentNullException(nameof(exceptionTypes), "exceptionTypes cannot be null");
            }

            foreach (Type exceptionType in exceptionTypes)
            {
                if (!typeof(Exception).IsAssignableFrom(exceptionType))
                {
                    throw new ArgumentException("All types to be ignored must derive from System.Exception", nameof(exceptionTypes));
                }
            }

            this.ignoredExceptions.AddRange(exceptionTypes);
        }

        /// <summary>
        /// Repeatedly applies this instance's input value to the given function until one of the following
        /// occurs:
        /// <para>
        /// <list type="bullet">
        /// <item>the function returns neither null nor false</item>
        /// <item>the function throws an exception that is not in the list of ignored exception types</item>
        /// <item>the timeout expires</item>
        /// </list>
        /// </para>
        /// </summary>
        /// <typeparam name="TResult">The delegate's expected return type.</typeparam>
        /// <param name="condition">A delegate taking an object of type T as its parameter, and returning a TResult.</param>
        /// <returns>The delegate's return value.</returns>
        public virtual TResult Until<TResult>(Func<T, TResult> condition)
        {
            return Until(condition, CancellationToken.None);
        }

        /// <summary>
        /// Repeatedly applies this instance's input value to the given function until one of the following
        /// occurs:
        /// <para>
        /// <list type="bullet">
        /// <item>the function returns neither null nor false</item>
        /// <item>the function throws an exception that is not in the list of ignored exception types</item>
        /// <item>the timeout expires</item>
        /// </list>
        /// </para>
        /// </summary>
        /// <typeparam name="TResult">The delegate's expected return type.</typeparam>
        /// <param name="condition">A delegate taking an object of type T as its parameter, and returning a TResult.</param>
        /// <param name="token">A cancellation token that can be used to cancel the wait.</param>
        /// <returns>The delegate's return value.</returns>
        public virtual TResult Until<TResult>(Func<T, TResult> condition, CancellationToken token)
        {
            if (condition == null)
            {
                throw new ArgumentNullException(nameof(condition), "condition cannot be null");
            }

            var resultType = typeof(TResult);
            if ((resultType.IsValueType && resultType != typeof(bool)) || !typeof(object).IsAssignableFrom(resultType))
            {
                throw new ArgumentException("Can only wait on an object or boolean response, tried to use type: " + resultType.ToString(), nameof(condition));
            }

            Exception lastException = null;
            var endTime = this.clock.LaterBy(this.timeout);
            while (true)
            {
                token.ThrowIfCancellationRequested();

                try
                {
                    var result = condition(this.input);
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
                catch (Exception ex)
                {
                    if (!this.IsIgnoredException(ex))
                    {
                        throw;
                    }

                    lastException = ex;
                }

                // Check the timeout after evaluating the function to ensure conditions
                // with a zero timeout can succeed.
                if (!this.clock.IsNowBefore(endTime))
                {
                    string timeoutMessage = string.Format(CultureInfo.InvariantCulture, "Timed out after {0} seconds", this.timeout.TotalSeconds);
                    if (!string.IsNullOrEmpty(this.message))
                    {
                        timeoutMessage += ": " + this.message;
                    }

                    this.ThrowTimeoutException(timeoutMessage, lastException);
                }

                Thread.Sleep(this.sleepInterval);
            }
        }

        /// <summary>
        /// Throws a <see cref="WebDriverTimeoutException"/> with the given message.
        /// </summary>
        /// <param name="exceptionMessage">The message of the exception.</param>
        /// <param name="lastException">The last exception thrown by the condition.</param>
        /// <remarks>This method may be overridden to throw an exception that is
        /// idiomatic for a particular test infrastructure.</remarks>
        protected virtual void ThrowTimeoutException(string exceptionMessage, Exception lastException)
        {
            throw new WebDriverTimeoutException(exceptionMessage, lastException);
        }

        private bool IsIgnoredException(Exception exception)
        {
            return this.ignoredExceptions.Any(type => type.IsAssignableFrom(exception.GetType()));
        }
    }
}
