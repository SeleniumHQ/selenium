// <copyright file="IJavaScriptEngineManager.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface allowing the user to manage settings in the browser's JavaScript engine.
    /// </summary>
    public interface IJavaScriptEngine
    {
        /// <summary>
        /// Occurs when a JavaScript callback with a named binding is executed.
        /// </summary>
        event EventHandler<JavaScriptCallbackExecutedEventArgs> JavaScriptCallbackExecuted;

        /// <summary>
        /// Occurs when an exeception is thrown by JavaScript being executed in the browser.
        /// </summary>
        event EventHandler<JavaScriptExceptionThrownEventArgs> JavaScriptExceptionThrown;

        /// <summary>
        /// Occurs when methods on the JavaScript console are called. 
        /// </summary>
        event EventHandler<JavaScriptConsoleApiCalledEventArgs> JavaScriptConsoleApiCalled;

        /// <summary>
        /// Gets the read-only list of initialization scripts added for this JavaScript engine.
        /// </summary>
        IReadOnlyList<InitializationScript> InitializationScripts { get; }

        /// <summary>
        /// Gets the read-only list of binding callbacks added for this JavaScript engine.
        /// </summary>
        IReadOnlyList<string> ScriptCallbackBindings { get; }

        /// <summary>
        /// Asynchronously starts monitoring for events from the browser's JavaScript engine.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task StartEventMonitoring();

        /// <summary>
        /// Stops monitoring for events from the browser's JavaScript engine.
        /// </summary>
        void StopEventMonitoring();

        /// <summary>
        /// Asynchronously adds JavaScript to be loaded on every document load.
        /// </summary>
        /// <param name="scriptName">The friendly name by which to refer to this initialization script.</param>
        /// <param name="script">The JavaScript to be loaded on every page.</param>
        /// <returns>A task containing an <see cref="InitializationScript"/> object representing the script to be loaded on each page.</returns>
        Task<InitializationScript> AddInitializationScript(string scriptName, string script);

        /// <summary>
        /// Asynchronously removes JavaScript from being loaded on every document load.
        /// </summary>
        /// <param name="scriptName">The friendly name of the initialization script to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task RemoveInitializationScript(string scriptName);

        /// <summary>
        /// Asynchronously removes all intialization scripts from being
        /// loaded on every document load.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task ClearInitializationScripts();

        /// <summary>
        /// Pins a JavaScript snippet for execution in the browser without transmitting the
        /// entire script across the wire for every execution.
        /// </summary>
        /// <param name="script">The JavaScript to pin</param>
        /// <returns>A task containing a <see cref="PinnedScript"/> object to use to execute the script.</returns>
        Task<PinnedScript> PinScript(string script);

        /// <summary>
        /// Unpins a previously pinned script from the browser.
        /// </summary>
        /// <param name="script">The <see cref="PinnedScript"/> object to unpin.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task UnpinScript(PinnedScript script);

        /// <summary>
        /// Asynchronously adds a binding to a callback method that will raise
        /// an event when the named binding is called by JavaScript executing
        /// in the browser.
        /// </summary>
        /// <param name="bindingName">The name of the callback that will trigger events when called by JavaScript executing in the browser.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddScriptCallbackBinding(string bindingName);

        /// <summary>
        /// Asynchronously removes a binding to a JavaScript callback.
        /// </summary>
        /// <param name="bindingName">The name of the callback to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task RemoveScriptCallbackBinding(string bindingName);

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task ClearScriptCallbackBindings();

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks and all
        /// initialization scripts from being loaded for each document.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task ClearAll();

        /// <summary>
        /// Asynchronously removes all bindings to JavaScript callbacks, all
        /// initialization scripts from being loaded for each document, and
        /// stops listening for events.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task Reset();
    }
}
