// <copyright file="WebElementWrapper.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections.ObjectModel;
using System.Drawing;

namespace OpenQA.Selenium
{
    public class WebElementWrapper : IWebElement, IWrapsElement
    {
        private readonly IWebElement _webElement;

        public WebElementWrapper(IWebElement element)
        {
            _webElement = element;
        }

        public IWebElement WrappedElement => _webElement;

        public string TagName => _webElement.TagName;

        public string Text => _webElement.Text;

        public bool Enabled => _webElement.Enabled;

        public bool Selected => _webElement.Selected;

        public Point Location => _webElement.Location;

        public Size Size => _webElement.Size;

        public bool Displayed => _webElement.Displayed;

        public void Clear()
        {
            _webElement.Clear();
        }

        public void Click()
        {
            _webElement.Click();
        }

        public IWebElement FindElement(By by)
        {
            return _webElement.FindElement(by);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return _webElement.FindElements(by);
        }

        public string GetAttribute(string attributeName)
        {
            return _webElement.GetAttribute(attributeName);
        }

        public string GetCssValue(string propertyName)
        {
            return _webElement.GetCssValue(propertyName);
        }

        public string GetDomAttribute(string attributeName)
        {
            return _webElement.GetDomAttribute(attributeName);
        }

        public string GetDomProperty(string propertyName)
        {
            return _webElement.GetDomProperty(propertyName);
        }

        public ISearchContext GetShadowRoot()
        {
            return _webElement.GetShadowRoot();
        }

        public void SendKeys(string text)
        {
            _webElement.SendKeys(text);
        }

        public void Submit()
        {
            _webElement.Submit();
        }
    }
}
