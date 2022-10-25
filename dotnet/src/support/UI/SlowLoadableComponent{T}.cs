// <copyright file="SlowLoadableComponent{T}.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.Threading;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// A <see cref="LoadableComponent{T}"/> which might not have finished loading when Load() returns. After a
    /// call to Load(), the IsLoaded property should continue to return false until the component has fully
    /// loaded. Use the HandleErrors() method to check for error conditions which caused the Load() to fail.
    /// <para>
    /// <pre class="code">
    /// new SlowHypotheticalComponent().Load();
    /// </pre>
    /// </para>
    /// </summary>
    /// <typeparam name="T">The type to be returned (normally the subclass' type)</typeparam>
    public abstract class SlowLoadableComponent<T> : LoadableComponent<T>
            where T : SlowLoadableComponent<T>
        {
        private readonly IClock clock;
        private readonly TimeSpan timeout;
        private TimeSpan sleepInterval = TimeSpan.FromMilliseconds(200);

        /// <summary>
        /// Initializes a new instance of the <see cref="SlowLoadableComponent{T}"/> class.
        /// </summary>
        /// <param name="timeout">The <see cref="TimeSpan"/> within which the component should be loaded.</param>
        protected SlowLoadableComponent(TimeSpan timeout)
            : this(timeout, new SystemClock())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SlowLoadableComponent{T}"/> class.
        /// </summary>
        /// <param name="timeout">The <see cref="TimeSpan"/> within which the component should be loaded.</param>
        /// <param name="clock">The <see cref="IClock"/> to use when measuring the timeout.</param>
        protected SlowLoadableComponent(TimeSpan timeout, IClock clock)
        {
            this.clock = clock;
            this.timeout = timeout;
        }

        /// <summary>
        /// Gets or sets the time to sleep between each check of the load status of the component.
        /// </summary>
        public TimeSpan SleepInterval
        {
            get { return this.sleepInterval; }
            set { this.sleepInterval = value; }
        }

        /// <summary>
        /// Gets the timeout interval before which this component must be considered loaded.
        /// </summary>
        protected TimeSpan Timeout
        {
            get { return this.timeout; }
        }

        /// <summary>
        /// Gets the clock object providing timing for monitoring the load status of this component.
        /// </summary>
        protected IClock Clock
        {
            get { return this.clock; }
        }

        /// <summary>
        /// Ensures that the component is currently loaded.
        /// </summary>
        /// <returns>The loaded component.</returns>
        /// <remarks>This is equivalent to the Get() method in Java version.</remarks>
        public override T Load()
        {
            if (this.IsLoaded)
            {
                return (T)this;
            }
            else
            {
                this.TryLoad();
            }

            DateTime end = this.clock.LaterBy(this.timeout);

            while (this.clock.IsNowBefore(end))
            {
                if (this.IsLoaded)
                {
                    return (T)this;
                }

                this.HandleErrors();
                this.Wait();
            }

            if (this.IsLoaded)
            {
                return (T)this;
            }
            else
            {
                if (string.IsNullOrEmpty(UnableToLoadMessage))
                {
                    this.UnableToLoadMessage = string.Format(CultureInfo.InvariantCulture, "Timed out after {0} seconds.", this.timeout.TotalSeconds);
                }

                throw new WebDriverTimeoutException(this.UnableToLoadMessage);
            }
        }

        /// <summary>
        /// Checks for well known error cases, which would mean that loading has finished, but an error
        /// condition was seen.
        /// </summary>
        /// <remarks>
        /// This method should be overridden so that expected errors can be automatically handled.
        /// </remarks>
        protected virtual void HandleErrors()
        {
            // no-op by default
        }

        /// <summary>
        /// Waits between polls of the load status of this component.
        /// </summary>
        protected virtual void Wait()
        {
            Thread.Sleep(this.sleepInterval);
        }
    }
}
