// <copyright file="JavaScript.cs" company="WebDriver Committers">
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
    /// Class representing the browser's JavaScript execution as referenced by the DevTools Protocol.
    /// </summary>
    public abstract class JavaScript
    {
        /// <summary>
        /// Occurs when a JavaScript script binding is called.
        /// </summary>
        public event EventHandler<BindingCalledEventArgs> BindingCalled;

        /// <summary>
        /// Occurs when the browser's JavaScript console API is called.
        /// </summary>
        public event EventHandler<ConsoleApiCalledEventArgs> ConsoleApiCalled;

        /// <summary>
        /// Occurs when a JavaScript exception is thrown.
        /// </summary>
        public event EventHandler<ExceptionThrownEventArgs> ExceptionThrown;

        /// <summary>
        /// Asynchronously enables the Runtime domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnableRuntime();

        /// <summary>
        /// Asynchronously disables the Runtime domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisableRuntime();

        /// <summary>
        /// Asynchronously enables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnablePage();

        /// <summary>
        /// Asynchronously disables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisablePage();

        /// <summary>
        /// Adds a binding to a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to bind to.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task AddBinding(string name);

        /// <summary>
        /// Removes a binding from a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to remove the bind from.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task RemoveBinding(string name);

        /// <summary>
        /// Adds a JavaScript snippet to evaluate when a new document is opened.
        /// </summary>
        /// <param name="script">The script to add to be evaluated when a new document is opened.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the internal ID of the script.</returns>
        public abstract Task<string> AddScriptToEvaluateOnNewDocument(string script);

        /// <summary>
        /// Removes a JavaScript snippet from evaluate when a new document is opened.
        /// </summary>
        /// <param name="scriptId">The ID of the script to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task RemoveScriptToEvaluateOnNewDocument(string scriptId);

        /// <summary>
        /// Evaluates a JavaScript snippet. It does not return a value.
        /// </summary>
        /// <param name="script">The script to evaluate</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        /// <remarks>
        /// This method is internal to the operation of pinned scripts in Selenium, and
        /// is therefore internal by design.
        /// </remarks>
        internal abstract Task Evaluate(string script);

        /// <summary>
        /// Raises the BindingCalled event.
        /// </summary>
        /// <param name="e">An <see cref="BindingCalledEventArgs"/> that contains the event data.</param>
        protected virtual void OnBindingCalled(BindingCalledEventArgs e)
        {
            if (this.BindingCalled != null)
            {
                this.BindingCalled(this, e);
            }
        }

        /// <summary>
        /// Raises the ConsoleApiCalled event.
        /// </summary>
        /// <param name="e">An <see cref="ConsoleApiCalledEventArgs"/> that contains the event data.</param>
        protected virtual void OnConsoleApiCalled(ConsoleApiCalledEventArgs e)
        {
            if (this.ConsoleApiCalled != null)
            {
                this.ConsoleApiCalled(this, e);
            }
        }

        /// <summary>
        /// Raises the ExceptionThrown event.
        /// </summary>
        /// <param name="e">An <see cref="ExceptionThrownEventArgs"/> that contains the event data.</param>
        protected virtual void OnExceptionThrown(ExceptionThrownEventArgs e)
        {
            if (this.ExceptionThrown != null)
            {
                this.ExceptionThrown(this, e);
            }
        }
    }
}
