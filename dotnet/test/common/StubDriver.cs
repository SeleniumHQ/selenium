// <copyright file="StubDriver.cs" company="Selenium Committers">
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

using System;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    public class StubDriver : IWebDriver
    {
        #region IWebDriver Members

        public string Url
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
            }
        }

        public string Title
        {
            get { throw new NotImplementedException(); }
        }

        public string PageSource
        {
            get { throw new NotImplementedException(); }
        }

        public string CurrentWindowHandle
        {
            get { throw new NotImplementedException(); }
        }

        public ReadOnlyCollection<string> WindowHandles
        {
            get { throw new NotImplementedException(); }
        }

        public void Close()
        {
            throw new NotImplementedException();
        }

        public void Quit()
        {
            throw new NotImplementedException();
        }

        public IOptions Manage()
        {
            throw new NotImplementedException();
        }

        public INavigation Navigate()
        {
            throw new NotImplementedException();
        }

        public ITargetLocator SwitchTo()
        {
            throw new NotImplementedException();
        }

        public System.Collections.ObjectModel.ReadOnlyCollection<string> GetWindowHandles()
        {
            throw new NotImplementedException();
        }

        public string GetWindowHandle()
        {
            throw new NotImplementedException();
        }

        #endregion

        #region ISearchContext Members

        public IWebElement FindElement(By by)
        {
            throw new NotImplementedException();
        }

        public System.Collections.ObjectModel.ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            throw new NotImplementedException();
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
