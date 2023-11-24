// <copyright file="Log.cs" company="WebDriver Committers">
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

using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class representing the browser's log as referenced by the DevTools Protocol.
    /// </summary>
    public abstract class Log
    {
        /// <summary>
        /// Occurs when an entry is added to the browser's log.
        /// </summary>
        public event EventHandler<EntryAddedEventArgs> EntryAdded;

        /// <summary>
        /// Asynchronously enables manipulation of the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task Enable();

        /// <summary>
        /// Asynchronously disables manipulation of the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task Disable();

        /// <summary>
        /// Asynchronously clears the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task Clear();

        /// <summary>
        /// Raises the EntryAdded event.
        /// </summary>
        /// <param name="e">An <see cref="EntryAddedEventArgs"/> that contains the event data.</param>
        protected virtual void OnEntryAdded(EntryAddedEventArgs e)
        {
            if (this.EntryAdded != null)
            {
                this.EntryAdded(this, e);
            }
        }
    }
}
