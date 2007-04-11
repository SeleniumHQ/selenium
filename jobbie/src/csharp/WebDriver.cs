/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

using System.Collections;
using System.Runtime.InteropServices;

namespace WebDriver
{
    [Guid("A8F55A35-8076-465b-BFC2-165F16340034")]
    [InterfaceType(ComInterfaceType.InterfaceIsIDispatch)]
    public interface WebDriver
    {
        // Properties
        string CurrentUrl { get; }
        string Title { get; }
        bool Visible { get; set; }

        // Navigation
        void Get(string url);

        // XPath goodness
        string SelectTextWithXPath(string xpath);
        ArrayList SelectElementsByXPath(string xpath);
        WebElement SelectElement(string selector);

        // Misc
        void DumpBody();
        void Close();

        TargetLocator SwitchTo();
    }

    [Guid("03D6E98A-9005-40eb-A0FF-5B31005E2FB7")]
    [InterfaceType(ComInterfaceType.InterfaceIsIDispatch)]
    public interface WebElement
    {
        void Click();
        void Submit();

        string Value { get; set; }
        string GetAttribute(string name);

        bool Toggle();
        void SetSelected();
        bool Selected { get; }

        bool Enabled { get; }
        string Text { get; }
        ArrayList GetChildrenOfType(string tagName);
    }

    public interface TargetLocator
    {
        WebDriver Frame(int index);
    }
}