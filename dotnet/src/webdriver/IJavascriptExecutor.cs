// <copyright file="IJavascriptExecutor.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user can execute JavaScript.
    /// </summary>
    public interface IJavaScriptExecutor
    {
        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        /// <remarks>
        /// <para>
        /// The <see cref="ExecuteScript"/>method executes JavaScript in the context of
        /// the currently selected frame or window. This means that "document" will refer
        /// to the current document. If the script has a return value, then the following
        /// steps will be taken:
        /// </para>
        /// <para>
        /// <list type="bullet">
        /// <item><description>For an HTML element, this method returns a <see cref="IWebElement"/></description></item>
        /// <item><description>For a number, a <see cref="long"/> is returned</description></item>
        /// <item><description>For a boolean, a <see cref="bool"/> is returned</description></item>
        /// <item><description>For all other cases a <see cref="string"/> is returned.</description></item>
        /// <item><description>For an array,we check the first element, and attempt to return a
        /// <see cref="List{T}"/> of that type, following the rules above. Nested lists are not
        /// supported.</description></item>
        /// <item><description>If the value is null or there is no return value,
        /// <see langword="null"/> is returned.</description></item>
        /// </list>
        /// </para>
        /// <para>
        /// Arguments must be a number (which will be converted to a <see cref="long"/>),
        /// a <see cref="bool"/>, a <see cref="string"/> or a <see cref="IWebElement"/>.
        /// An exception will be thrown if the arguments do not meet these criteria.
        /// The arguments will be made available to the JavaScript via the "arguments" magic
        /// variable, as if the function were called via "Function.apply"
        /// </para>
        /// </remarks>
        object ExecuteScript(string script, params object[] args);

        /// <summary>
        /// Executes JavaScript asynchronously in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        object ExecuteAsyncScript(string script, params object[] args);
    }
}
