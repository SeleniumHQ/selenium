// <copyright file="IBrowserExtensionAction.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user interacts with the actions exposed by a specific browser extension.
    /// </summary>
    public interface IBrowserExtensionAction
    {
        /// <summary>
        /// Gets the title of this browser extension action.
        /// </summary>
        string ActionTitle { get; }

        /// <summary>
        /// Gets the relative path to the browser extension action's icon resource on disk (if applicable).
        /// </summary>
        string Icon { get; }

        /// <summary>
        /// Gets the text associated with the extension action icon (if applicable).
        /// </summary>
        string BadgeText { get; }

        /// <summary>
        /// Gets the type of the browser extension action.
        /// </summary>
        string Type { get; }

        /// <summary>
        /// Invokes an action exposed by the browser extension action.
        /// </summary>
        void TakeAction();
    }
}
