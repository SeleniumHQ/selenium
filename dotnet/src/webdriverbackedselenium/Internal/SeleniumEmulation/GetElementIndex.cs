// <copyright file="GetElementIndex.cs" company="WebDriver Committers">
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

using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getElementIndex keyword.
    /// </summary>
    internal class GetElementIndex : SeleneseCommand
    {
        private const string ElementIndexFinderScript =
@"var _isCommentOrEmptyTextNode = function(node) {
    return node.nodeType == 8 || ((node.nodeType == 3) && !(/[^\\t\\n\\r ]/.test(node.data)));
}
var element = arguments[0];
var previousSibling;
var index = 0;
while ((previousSibling = element.previousSibling) != null) {
    if (!_isCommentOrEmptyTextNode(previousSibling)) {
        index++;
    }
    element = previousSibling;
}
return index;";

        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetElementIndex"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public GetElementIndex(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = this.finder.FindElement(driver, locator);
            return JavaScriptLibrary.ExecuteScript(driver, ElementIndexFinderScript, element);
        }
    }
}
