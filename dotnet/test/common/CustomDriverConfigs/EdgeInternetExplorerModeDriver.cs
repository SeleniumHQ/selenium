// <copyright file="EdgeInternetExplorerModeDriver.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.IE
{
    // This is a simple wrapper class to create an InternetExplorerDriver that
    // uses the enables RequireWindowFocus as the default input simplation.
    public class EdgeInternetExplorerModeDriver : InternetExplorerDriver
    {

        public EdgeInternetExplorerModeDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public EdgeInternetExplorerModeDriver(InternetExplorerOptions options)
            : base(options)
        {
        }

        public EdgeInternetExplorerModeDriver(InternetExplorerDriverService service, InternetExplorerOptions options)
            : base(service, options)
        {
        }

        public static InternetExplorerOptions DefaultOptions
        {
            get { return new InternetExplorerOptions() { RequireWindowFocus = true, UsePerProcessProxy = true, AttachToEdgeChrome = true }; }
        }
    }
}
