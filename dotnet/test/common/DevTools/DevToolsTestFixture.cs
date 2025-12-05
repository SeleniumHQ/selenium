// <copyright file="DevToolsTestFixture.cs" company="Selenium Committers">
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

using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools;

public class DevToolsTestFixture : DriverTestFixture
{
    protected IDevTools devTools;
    protected IDevToolsSession session;

    public bool IsDevToolsSupported
    {
        get { return devTools != null; }
    }

    [SetUp]
    public void Setup()
    {
        driver = EnvironmentManager.Instance.GetCurrentDriver();
        devTools = driver as IDevTools;
        if (devTools == null)
        {
            Assert.Ignore($"{EnvironmentManager.Instance.Browser} does not support Chrome DevTools Protocol");
            return;
        }

        session = devTools.GetDevToolsSession();
    }

    [TearDown]
    public void Teardown()
    {
        if (session != null)
        {
            session.Dispose();
            EnvironmentManager.Instance.CloseCurrentDriver();
            session = null;
            driver = null;
        }
    }
}
