// <copyright file="V116JavaScript.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.DevTools.V116.Page;
using OpenQA.Selenium.DevTools.V116.Runtime;

namespace OpenQA.Selenium.DevTools.V116
{
    /// <summary>
    /// Class containing the JavaScript implementation for version 116 of the DevTools Protocol.
    /// </summary>
    public class V116JavaScript : JavaScript
    {
        private RuntimeAdapter runtime;
        private PageAdapter page;

        /// <summary>
        /// Initializes a new instance of the <see cref="V116JavaScript"/> class.
        /// </summary>
        /// <param name="runtime">The DevTools Protocol adapter for the Runtime domain.</param>
        /// <param name="page">The DevTools Protocol adapter for the Page domain.</param>
        public V116JavaScript(RuntimeAdapter runtime, PageAdapter page)
        {
            this.runtime = runtime;
            this.page = page;
            this.runtime.BindingCalled += OnRuntimeBindingCalled;
            this.runtime.ConsoleAPICalled += OnRuntimeConsoleApiCalled;
            this.runtime.ExceptionThrown += OnRuntimeExceptionThrown;
        }

        /// <summary>
        /// Asynchronously enables the Runtime domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task EnableRuntime()
        {
            await runtime.Enable();
        }

        /// <summary>
        /// Asynchronously disables the Runtime domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task DisableRuntime()
        {
            await runtime.Disable();
        }

        /// <summary>
        /// Asynchronously enables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task EnablePage()
        {
            await page.Enable();
        }

        /// <summary>
        /// Asynchronously disables the Page domain in the DevTools Protocol.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task DisablePage()
        {
            await page.Disable();
        }

        /// <summary>
        /// Adds a binding to a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to bind to.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task AddBinding(string name)
        {
            await runtime.AddBinding(new AddBindingCommandSettings() { Name = name });
        }

        /// <summary>
        /// Removes a binding from a specific JavaScript name.
        /// </summary>
        /// <param name="name">The name to which to remove the bind from.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task RemoveBinding(string name)
        {
            await runtime.RemoveBinding(new RemoveBindingCommandSettings() { Name = name });
        }

        /// <summary>
        /// Adds a JavaScript snippet to evaluate when a new document is opened.
        /// </summary>
        /// <param name="script">The script to add to be evaluated when a new document is opened.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the internal ID of the script.</returns>
        public override async Task<string> AddScriptToEvaluateOnNewDocument(string script)
        {
            var result = await page.AddScriptToEvaluateOnNewDocument(new AddScriptToEvaluateOnNewDocumentCommandSettings() { Source = script });
            return result.Identifier;
        }

        /// <summary>
        /// Removes a JavaScript snippet from evaluate when a new document is opened.
        /// </summary>
        /// <param name="scriptId">The ID of the script to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task RemoveScriptToEvaluateOnNewDocument(string scriptId)
        {
            await page.RemoveScriptToEvaluateOnNewDocument(new RemoveScriptToEvaluateOnNewDocumentCommandSettings() { Identifier = scriptId });
        }

        /// <summary>
        /// Evaluates a JavaScript snippet. It does not return a value.
        /// </summary>
        /// <param name="script">The script to evaluate</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        /// <remarks>
        /// This method is internal to the operation of pinned scripts in Selenium, and
        /// is therefore internal by design.
        /// </remarks>
        internal override async Task Evaluate(string script)
        {
            await runtime.Evaluate(new EvaluateCommandSettings { Expression = script });
        }

        private void OnRuntimeBindingCalled(object sender, Runtime.BindingCalledEventArgs e)
        {
            BindingCalledEventArgs wrapped = new BindingCalledEventArgs()
            {
                ExecutionContextId = e.ExecutionContextId,
                Name = e.Name,
                Payload = e.Payload
            };

            this.OnBindingCalled(wrapped);
        }

        private void OnRuntimeExceptionThrown(object sender, Runtime.ExceptionThrownEventArgs e)
        {
            // TODO: Collect stack trace elements
            var wrapped = new ExceptionThrownEventArgs()
            {
                Timestamp = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                Message = e.ExceptionDetails.Text
            };

            this.OnExceptionThrown(wrapped);
        }

        private void OnRuntimeConsoleApiCalled(object sender, ConsoleAPICalledEventArgs e)
        {
            List<ConsoleApiArgument> args = new List<ConsoleApiArgument>();
            foreach (var arg in e.Args)
            {
                string argValue = null;
                if (arg.Value != null)
                {
                    argValue = arg.Value.ToString();
                }
                args.Add(new ConsoleApiArgument() { Type = arg.Type.ToString(), Value = argValue });
            }

            var wrapped = new ConsoleApiCalledEventArgs()
            {
                Timestamp = new DateTime(1979, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(e.Timestamp),
                Type = e.Type,
                Arguments = args.AsReadOnly()
            };

            this.OnConsoleApiCalled(wrapped);
        }
    }
}
