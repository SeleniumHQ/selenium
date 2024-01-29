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

using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    public class NeedsFreshDriverAttribute : TestActionAttribute
    {
        private bool isCreatedBeforeTest = false;
        private bool isCreatedAfterTest = false;

        public bool IsCreatedBeforeTest
        {
            get { return isCreatedBeforeTest; }
            set { isCreatedBeforeTest = value; }
        }

        public bool IsCreatedAfterTest
        {
            get { return isCreatedAfterTest; }
            set { isCreatedAfterTest = value; }
        }

        public override void BeforeTest(ITest test)
        {
            DriverTestFixture fixtureInstance = test.Fixture as DriverTestFixture;
            if (fixtureInstance != null && this.isCreatedBeforeTest)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }
            base.BeforeTest(test);
        }

        public override void AfterTest(ITest test)
        {
            DriverTestFixture fixtureInstance = test.Fixture as DriverTestFixture;
            if (fixtureInstance != null && this.isCreatedAfterTest)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }
        }
    }
}
