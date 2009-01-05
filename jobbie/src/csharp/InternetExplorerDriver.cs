/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Xml.XPath;

namespace WebDriver
{
    [Guid("9077DEDA-652B-4efd-9560-3692086D4670")]
    [ClassInterface(ClassInterfaceType.None)]
    [ProgId("InternetExploderFox")]
    public class InternetExplorerDriver : WebDriver, IXPathNavigable, IDisposable
    {
        private IList<IeWrapper> allWrappers = new List<IeWrapper>();
        private IeWrapper currentWrapper;

        public InternetExplorerDriver()
        {
            currentWrapper = new IeWrapper(this);
            allWrappers.Add(currentWrapper);
        }

        public void Get(string url)
        {
            currentWrapper.Get(url);
        }

        public string SelectTextWithXPath(string xpath)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectTextWithXPath(xpath);
        }

        public ArrayList SelectElementsByXPath(string xpath)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectElementsByXPath(xpath);
        }

        public WebElement SelectElement(string selector)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectElement(selector);
        }

        public void DumpBody()
        {
            currentWrapper.WaitForLoadToComplete();
            currentWrapper.DumpBody();
        }

        public void Close()
        {
            currentWrapper.Close();
        }

        public TargetLocator SwitchTo()
        {
            return currentWrapper.SwitchTo();
        }

        public string CurrentUrl
        {
            get
            {
                currentWrapper.WaitForLoadToComplete();
                return currentWrapper.CurrentUrl;
            }
        }

        public string Title
        {
            get
            {
                currentWrapper.WaitForLoadToComplete();
                return currentWrapper.Title;
            }
        }

        public bool Visible
        {
            get { return currentWrapper.Visible; }
            set { currentWrapper.Visible = value; }
        }

        public void Dispose()
        {
            currentWrapper.Dispose();
        }

        public XPathNavigator CreateNavigator()
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.CreateNavigator();
        }

        internal void AddWrapper(IeWrapper wrapper)
        {
            allWrappers.Add(wrapper);
            currentWrapper = wrapper;
        }

        public WebDriver SwitchToWindow(int index)
        {
            currentWrapper = allWrappers[index];
            return this;
        }
    }
}
