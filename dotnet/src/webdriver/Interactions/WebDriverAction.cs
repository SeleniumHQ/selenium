// <copyright file="WebDriverAction.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Interactions.Internal
{
    /// <summary>
    /// Defines an action for keyboard and mouse interaction with the browser.
    /// </summary>
    internal abstract class WebDriverAction
    {
        private ILocatable where;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverAction"/> class for the given element.
        /// </summary>
        /// <param name="actionLocation">An <see cref="ILocatable"/> object that provides coordinates for this action.</param>
        protected WebDriverAction(ILocatable actionLocation)
        {
            this.where = actionLocation;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverAction"/> class.
        /// </summary>
        /// <remarks>This action will take place in the context of the previous action's coordinates.</remarks>
        protected WebDriverAction()
        {
        }

        /// <summary>
        /// Gets the target of the action providing coordinates of the action.
        /// </summary>
        protected ILocatable ActionTarget
        {
            get { return this.where; }
        }
    }
}
