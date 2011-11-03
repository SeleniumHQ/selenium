// <copyright file="How.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides the lookup methods for the FindsBy attribute (for using in PageObjects)
    /// </summary>
    public enum How
    {
        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.Id" />
        /// </summary>
        Id,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.Name" />
        /// </summary>
        Name,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.TagName" />
        /// </summary>
        TagName,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.ClassName" />
        /// </summary>
        ClassName,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.CssSelector" />
        /// </summary>
        CssSelector,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.LinkText" />
        /// </summary>
        LinkText,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.PartialLinkText" />
        /// </summary>
        PartialLinkText,

        /// <summary>
        /// Finds by <see cref="OpenQA.Selenium.By.XPath" />
        /// </summary>
        XPath
    }
}