// <copyright file="TableCellElement.cs" company="WebDriver Committers">
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

﻿namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    ///     Wraps an IWebElement into a user-friendly table-data-element
    /// </summary>
    public class TableCellElement
    {
        /// <summary>
        /// Access to the WebElement for further navigation through complex WebElements.
        /// </summary>
        public readonly IWebElement WebElement;

    /// <summary>
    /// Initializes a new instance of the <see cref="TableCellElement"/> class.
    /// </summary>
    /// <param name="webElement">The IWebElement that is wrapped</param>
    public TableCellElement(IWebElement webElement)
        {
            this.WebElement = webElement;
        }

        /// <summary>
        ///     The html tagname of the IWebElement
        /// </summary>
        public string TagName => this.WebElement.TagName;

        public string Text => this.WebElement.Text;
    }
}