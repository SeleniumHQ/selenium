// <copyright file="V86JavaScript.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools.V86.Page;
using OpenQA.Selenium.DevTools.V86.Runtime;

namespace OpenQA.Selenium.DevTools.V86
{
    /// <summary>
    /// Class containing the JavaScript implementation for version 85 of the DevTools Protocol.
    /// </summary>
    public class V86JavaScript : IJavaScript
    {
        private RuntimeAdapter runtime;
        private PageAdapter page;

        /// <summary>
        /// Initializes a new instance of the <see cref="V86JavaScript"/> class.
        /// </summary>
        /// <param name="runtime">The DevTools Protocol adapter for the Runtime domain.</param>
        /// <param name="page">The DevTools Protocol adapter for the Page domain.</param>
        public V86JavaScript(RuntimeAdapter runtime, PageAdapter page)
        {
            this.runtime = runtime;
            this.page = page;
            this.runtime.BindingCalled += OnRuntimeBindingCalled;
            this.runtime.ConsoleAPICalled += OnRuntimeConsoleApiCalled;
            this.runtime.ExceptionThrown += OnRuntimeExceptionThrown;
        }

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
        public async Task EnableRuntime()
        {
            await runtime.Enable();
        }

        /// <summary>
        /// Asynchronously disables the Runtime domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task DisableRuntime()
        {
            await runtime.Disable();
        }

        /// <summary>
        /// Asynchronously enables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task EnablePage()
        {
            await page.Enable();
        }

        /// <summary>
        /// Asynchronously disables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task DisablePage()
        {
            await page.Disable();
        }

        /// <summary>
        /// Adds a binding to a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to bind to.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task AddBinding(string name)
        {
            await runtime.AddBinding(new AddBindingCommandSettings() { Name = name });
        }

        /// <summary>
        /// Removes a binding from a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to remove the bind from.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task RemoveBinding(string name)
        {
            await runtime.RemoveBinding(new RemoveBindingCommandSettings() { Name = name });
        }

        /// <summary>
        /// Adds a JavaScript snippet to evaluate when a new document is opened.
        /// </summary>
        /// <param name="script">The script to add to be evaluated when a new document is opened.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the internal ID of the script.</returns>
        public async Task<string> AddScriptToEvaluateOnNewDocument(string script)
        {
            var result = await page.AddScriptToEvaluateOnNewDocument(new AddScriptToEvaluateOnNewDocumentCommandSettings() { Source = script });
            return result.Identifier;
        }

        /// <summary>
        /// Removes a JavaScript snippet from evaluate when a new document is opened.
        /// </summary>
        /// <param name="scriptId">The ID of the script to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task RemoveScriptToEvaluateOnNewDocument(string scriptId)
        {
            await page.RemoveScriptToEvaluateOnNewDocument(new RemoveScriptToEvaluateOnNewDocumentCommandSettings() { Identifier = scriptId });
        }

        private void OnRuntimeBindingCalled(object sender, Runtime.BindingCalledEventArgs e)
        {
            if (this.BindingCalled != null)
            {
                BindingCalledEventArgs wrapped = new BindingCalledEventArgs()
                {
                    ExecutionContextId = e.ExecutionContextId,
                    Name = e.Name,
                    Payload = e.Payload
                };
                this.BindingCalled(this, wrapped);
            }
        }

        private void OnRuntimeExceptionThrown(object sender, Runtime.ExceptionThrownEventArgs e)
        {
            if (this.ExceptionThrown != null)
            {
                var wrapped = new ExceptionThrownEventArgs()
                {
                    Timestamp = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                    Message = e.ExceptionDetails.Text
                };

                // TODO: Collect stack trace elements
                this.ExceptionThrown(this, wrapped);
            }
        }

        private void OnRuntimeConsoleApiCalled(object sender, ConsoleAPICalledEventArgs e)
        {
            if (this.ConsoleApiCalled != null)
            {
                var wrapped = new ConsoleApiCalledEventArgs()
                {
                    Timestamp = new DateTime(1979, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                    Type = e.Type,
                    Arguments = new List<ConsoleApiArgument>()
                };

                foreach (var arg in e.Args)
                {
                    string argValue = null;
                    if (arg.Value != null)
                    {
                        argValue = arg.Value.ToString();
                    }
                    wrapped.Arguments.Add(new ConsoleApiArgument() { Type = arg.Type.ToString(), Value = argValue });
                }

                this.ConsoleApiCalled(this, wrapped);
            }
        }
    }
}
