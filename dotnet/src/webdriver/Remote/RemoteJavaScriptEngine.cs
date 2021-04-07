// <copyright file="RemoteJavaScriptEngine.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides methods allowing the user to manage settings in the browser's JavaScript engine.
    /// </summary>
    public class RemoteJavaScriptEngine : IJavaScriptEngine
    {
        private Lazy<DevToolsSession> session;
        private Dictionary<string, InitializationScript> initializationScripts = new Dictionary<string, InitializationScript>();
        private List<string> bindings = new List<string>();
        private bool isEnabled = false;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteJavaScriptEngine"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> instance in which the JavaScript engine is executing.</param>
        public RemoteJavaScriptEngine(IWebDriver driver)
        {
            this.session = new Lazy<DevToolsSession>(() =>
            {
                IDevTools devToolsDriver = driver as IDevTools;
                if (session == null)
                {
                    throw new WebDriverException("Driver must implement IDevTools to use these features");
                }

                return devToolsDriver.GetDevToolsSession();
            });
        }

        /// <summary>
        /// Occurs when a JavaScript callback with a named binding is executed.
        /// </summary>
        public event EventHandler<JavaScriptCallbackExecutedEventArgs> JavaScriptCallbackExecuted;

        /// <summary>
        /// Occurs when an exeception is thrown by JavaScript being executed in the browser.
        /// </summary>
        public event EventHandler<JavaScriptExceptionThrownEventArgs> JavaScriptExceptionThrown;

        /// <summary>
        /// Occurs when methods on the JavaScript console are called. 
        /// </summary>
        public event EventHandler<JavaScriptConsoleApiCalledEventArgs> JavaScriptConsoleApiCalled;

        /// <summary>
        /// Gets the read-only list of initialization scripts added for this JavaScript engine.
        /// </summary>
        public IReadOnlyList<InitializationScript> InitializationScripts
        {
            get
            {
                // Return a copy.
                return new List<InitializationScript>(this.initializationScripts.Values);
            }
        }

        /// <summary>
        /// Gets the read-only list of bindings added for this JavaScript engine.
        /// </summary>
        public IReadOnlyList<string> ScriptCallbackBindings
        {
            get
            {
                // Return a copy.
                return new List<string>(this.bindings);
            }
        }

        /// <summary>
        /// Asynchronously starts monitoring for events from the browser's JavaScript engine.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task StartEventMonitoring()
        {
            this.session.Value.Domains.JavaScript.BindingCalled += OnScriptBindingCalled;
            this.session.Value.Domains.JavaScript.ExceptionThrown += OnJavaScriptExceptionThrown;
            this.session.Value.Domains.JavaScript.ConsoleApiCalled += OnConsoleApiCalled;
            await this.EnableDomains();
        }

        /// <summary>
        /// Stops monitoring for events from the browser's JavaScript engine.
        /// </summary>
        public void StopEventMonitoring()
        {
            this.session.Value.Domains.JavaScript.ConsoleApiCalled -= OnConsoleApiCalled;
            this.session.Value.Domains.JavaScript.ExceptionThrown -= OnJavaScriptExceptionThrown;
            this.session.Value.Domains.JavaScript.BindingCalled -= OnScriptBindingCalled;
        }

        /// <summary>
        /// Asynchronously adds JavaScript to be loaded on every document load.
        /// </summary>
        /// <param name="scriptName">The friendly name by which to refer to this initialization script.</param>
        /// <param name="script">The JavaScript to be loaded on every page.</param>
        /// <returns>A task containing an <see cref="InitializationScript"/> object representing the script to be loaded on each page.</returns>
        public async Task<InitializationScript> AddInitializationScript(string scriptName, string script)
        {
            if (this.initializationScripts.ContainsKey(scriptName))
            {
                return this.initializationScripts[scriptName];
            }

            await this.EnableDomains();

            string scriptId = await this.session.Value.Domains.JavaScript.AddScriptToEvaluateOnNewDocument(script);
            InitializationScript initializationScript = new InitializationScript()
            {
                ScriptId = scriptId,
                ScriptName = scriptName,
                ScriptSource = script
            };

            this.initializationScripts[scriptName] = initializationScript;
            return initializationScript;
        }

        /// <summary>
        /// Asynchronously removes JavaScript from being loaded on every document load.
        /// </summary>
        /// <param name="scriptName">The friendly name of the initialization script to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task RemoveInitializationScript(string scriptName)
        {
            if (this.initializationScripts.ContainsKey(scriptName))
            {
                string scriptId = this.initializationScripts[scriptName].ScriptId;
                await this.session.Value.Domains.JavaScript.RemoveScriptToEvaluateOnNewDocument(scriptId);
                this.initializationScripts.Remove(scriptName);
            }
        }

        /// <summary>
        /// Asynchronously removes all intialization scripts from being loaded on every document load.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task ClearInitializationScripts()
        {
            // Use a copy of the list to prevent the iterator from becoming invalid
            // when we modify the collection.
            List<string> scriptNames = new List<string>(this.initializationScripts.Keys);
            foreach (string scriptName in scriptNames)
            {
                await this.RemoveInitializationScript(scriptName);
            }
        }

        /// <summary>
        /// Asynchronously adds a binding to a callback method that will raise an event when the named
        /// binding is called by JavaScript executing in the browser.
        /// </summary>
        /// <param name="bindingName">The name of the callback that will trigger events when called by JavaScript executing in the browser.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task AddScriptCallbackBinding(string bindingName)
        {
            if (this.bindings.Contains(bindingName))
            {
                throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "A binding named {0} has already been added", bindingName));
            }

            await this.EnableDomains();
            await this.session.Value.Domains.JavaScript.AddBinding(bindingName);
        }

        /// <summary>
        /// Asynchronously removes a binding to a JavaScript callback.
        /// </summary>
        /// <param name="bindingName">The name of the callback to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task RemoveScriptCallbackBinding(string bindingName)
        {
            await this.session.Value.Domains.JavaScript.RemoveBinding(bindingName);
            this.bindings.Remove(bindingName);
        }

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task ClearScriptCallbackBindings()
        {
            // Use a copy of the list to prevent the iterator from becoming invalid
            // when we modify the collection.
            List<string> bindingList = new List<string>(this.bindings);
            foreach (string binding in bindingList)
            {
                await this.RemoveScriptCallbackBinding(binding);
            }
        }

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks and all
        /// initialization scripts from being loaded for each document.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task ClearAll()
        {
            await this.ClearInitializationScripts();
            await this.ClearScriptCallbackBindings();
        }

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks, all
        /// initialization scripts from being loaded for each document, and
        /// stops listening for events.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task Reset()
        {
            StopEventMonitoring();
            await ClearAll();
        }

        private async Task EnableDomains()
        {
            if (!this.isEnabled)
            {
                await this.session.Value.Domains.JavaScript.EnablePage();
                await this.session.Value.Domains.JavaScript.EnableRuntime();
                this.isEnabled = true;
            }
        }

        private void OnScriptBindingCalled(object sender, BindingCalledEventArgs e)
        {
            if (this.JavaScriptCallbackExecuted != null)
            {
                this.JavaScriptCallbackExecuted(this, new JavaScriptCallbackExecutedEventArgs()
                {
                    ScriptPayload = e.Payload,
                    BindingName = e.Name
                });
            }
        }

        private void OnJavaScriptExceptionThrown(object sender, ExceptionThrownEventArgs e)
        {
            if (this.JavaScriptExceptionThrown != null)
            {
                this.JavaScriptExceptionThrown(this, new JavaScriptExceptionThrownEventArgs()
                {
                    Message = e.Message
                });
            }
        }


        private void OnConsoleApiCalled(object sender, ConsoleApiCalledEventArgs e)
        {
            if (this.JavaScriptConsoleApiCalled != null)
            {
                this.JavaScriptConsoleApiCalled(this, new JavaScriptConsoleApiCalledEventArgs()
                {
                    MessageContent = e.Arguments[0].Value,
                    MessageTimeStamp = e.Timestamp,
                    MessageType = e.Type
                });
            }
        }
    }
}
