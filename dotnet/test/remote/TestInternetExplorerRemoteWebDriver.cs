// <copyright file="TestInternetExplorerRemoteWebDriver.cs" company="Selenium Committers">
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
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium.Remote
{
    // This is a simple wrapper class to create a RemoteWebDriver that
    // has no parameters in the constructor.
    public class TestInternetExplorerRemoteWebDriver : RemoteWebDriver
    {
        public TestInternetExplorerRemoteWebDriver()
            : base(new Uri("http://127.0.0.1:6000/wd/hub/"), new InternetExplorerOptions())
        {
            this.FileDetector = new LocalFileDetector();
        }
    }
}
