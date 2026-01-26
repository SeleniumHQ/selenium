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

namespace OpenQA.Selenium;

public class WebElementWrapper(IWebElement element) : IWebElement, IWrapsElement
{
    public IWebElement WrappedElement { get; } = element;

    public string TagName => WrappedElement.TagName;

    public string Text => WrappedElement.Text;

    public bool Enabled => WrappedElement.Enabled;

    public bool Selected => WrappedElement.Selected;

    public Point Location => WrappedElement.Location;

    public Size Size => WrappedElement.Size;

    public bool Displayed => WrappedElement.Displayed;

    public void Clear()
    {
        WrappedElement.Clear();
    }

    public void Click()
    {
        WrappedElement.Click();
    }

    public IWebElement FindElement(By by)
    {
        return WrappedElement.FindElement(by);
    }

    public ReadOnlyCollection<IWebElement> FindElements(By by)
    {
        return WrappedElement.FindElements(by);
    }

    public string GetAttribute(string attributeName)
    {
        return WrappedElement.GetAttribute(attributeName);
    }

    public string GetCssValue(string propertyName)
    {
        return WrappedElement.GetCssValue(propertyName);
    }

    public string GetDomAttribute(string attributeName)
    {
        return WrappedElement.GetDomAttribute(attributeName);
    }

    public string GetDomProperty(string propertyName)
    {
        return WrappedElement.GetDomProperty(propertyName);
    }

    public ISearchContext GetShadowRoot()
    {
        return WrappedElement.GetShadowRoot();
    }

    public void SendKeys(string text)
    {
        WrappedElement.SendKeys(text);
    }

    public void Submit()
    {
        WrappedElement.Submit();
    }
}
