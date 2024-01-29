// <copyright file="IgnoreTargetAttribute.cs" company="Selenium Committers">
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
using System;
using NUnit.Framework.Internal;
using System.Collections.Generic;
using OpenQA.Selenium.Environment;


namespace OpenQA.Selenium
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class IgnoreTargetAttribute : NUnitAttribute, IApplyToTest
    {
        private readonly String target;
        private readonly string ignoreReason = string.Empty;

        public IgnoreTargetAttribute(string target)
        {
            this.target = target.ToLower();
        }

        public IgnoreTargetAttribute(string target, string reason)
            : this(target)
        {
            this.ignoreReason = reason;
        }

        public string Value
        {
            get { return target; }
        }

        public string Reason
        {
            get { return ignoreReason; }
        }

        public void ApplyToTest(Test test)
        {
            if (test.RunState != RunState.NotRunnable)
            {
                List<Attribute> ignoreAttributes = new List<Attribute>();
                if (test.IsSuite)
                {
                    Attribute[] ignoreClassAttributes =
                        test.TypeInfo.GetCustomAttributes<IgnoreTargetAttribute>(true);
                    if (ignoreClassAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreClassAttributes);
                    }
                }
                else
                {
                    IgnoreTargetAttribute[] ignoreMethodAttributes =
                        test.Method.GetCustomAttributes<IgnoreTargetAttribute>(true);
                    if (ignoreMethodAttributes.Length > 0)
                    {
                        ignoreAttributes.AddRange(ignoreMethodAttributes);
                    }
                }

                foreach (Attribute attr in ignoreAttributes)
                {
                    IgnoreTargetAttribute platformToIgnoreAttr = attr as IgnoreTargetAttribute;
                    if (platformToIgnoreAttr != null && IgnoreTestForPlatform(platformToIgnoreAttr.Value))
                    {
                        string ignoreReason =
                            "Ignoring target " + EnvironmentManager.Instance.Browser.ToString() + ".";
                        if (!string.IsNullOrEmpty(platformToIgnoreAttr.Reason))
                        {
                            ignoreReason = ignoreReason + " " + platformToIgnoreAttr.Reason;
                        }

                        test.RunState = RunState.Ignored;
                        test.Properties.Set(PropertyNames.SkipReason, platformToIgnoreAttr.Reason);
                    }
                }
            }
        }

        private bool IgnoreTestForPlatform(string platformToIgnore)
        {
            return CurrentPlatform() != null && platformToIgnore.Equals(CurrentPlatform());
        }

        private string CurrentPlatform()
        {
            return "net6";
        }
    }
}
