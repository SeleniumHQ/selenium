// <copyright file="NeedsFreshDriverAttribute.cs" company="Selenium Committers">
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

using NUnit.Framework.Interfaces;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests.Infrastructure;

public class NeedsFreshDriverAttribute : TestActionAttribute
{
    public bool IsCreatedBeforeTest { get; set; } = false;

    public bool IsCreatedAfterTest { get; set; } = false;

    public override void BeforeTest(ITest test)
    {
        if (test.Fixture is DriverTestFixture fixtureInstance && this.IsCreatedBeforeTest)
        {
            EnvironmentManager.Instance.CreateFreshDriver();
            fixtureInstance.Driver = EnvironmentManager.Instance.GetCurrentDriver();
        }

        base.BeforeTest(test);
    }

    public override void AfterTest(ITest test)
    {
        if (test.Fixture is DriverTestFixture fixtureInstance && this.IsCreatedAfterTest)
        {
            EnvironmentManager.Instance.CreateFreshDriver();
            fixtureInstance.Driver = EnvironmentManager.Instance.GetCurrentDriver();
        }

        base.AfterTest(test);
    }
}
