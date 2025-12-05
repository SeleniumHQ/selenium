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
using NUnit.Framework.Internal;
using OpenQA.Selenium.Environment;
using System;

#nullable enable

namespace OpenQA.Selenium;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class IgnoreTargetAttribute : NUnitAttribute, IApplyToTest
{
    public IgnoreTargetAttribute(string target)
    {
        this.Value = target.ToLower();
    }

    public IgnoreTargetAttribute(string target, string reason)
        : this(target)
    {
        this.Reason = reason;
    }

    public string Value { get; }

    public string Reason { get; } = string.Empty;

    public void ApplyToTest(Test test)
    {
        if (test.RunState is RunState.NotRunnable)
        {
            return;
        }
        IgnoreTargetAttribute[] ignoreAttributes;
        if (test.IsSuite)
        {
            ignoreAttributes = test.TypeInfo!.GetCustomAttributes<IgnoreTargetAttribute>(true);
        }
        else
        {
            ignoreAttributes = test.Method!.GetCustomAttributes<IgnoreTargetAttribute>(true);
        }

        foreach (IgnoreTargetAttribute platformToIgnoreAttr in ignoreAttributes)
        {
            if (IgnoreTestForPlatform(platformToIgnoreAttr.Value))
            {
                string ignoreReason = $"Ignoring target {EnvironmentManager.Instance.Browser}";
                if (!string.IsNullOrEmpty(platformToIgnoreAttr.Reason))
                {
                    ignoreReason = ignoreReason + ": " + platformToIgnoreAttr.Reason;
                }

                test.RunState = RunState.Ignored;
                test.Properties.Set(PropertyNames.SkipReason, ignoreReason);

            }
        }
    }

    private static bool IgnoreTestForPlatform(string platformToIgnore)
    {
        return CurrentPlatform().Equals(platformToIgnore, StringComparison.OrdinalIgnoreCase);
    }

    private static string CurrentPlatform()
    {
#if NET8_0
        return "net8";
#else
#error Update IgnoreTargetAttribute.CurrentPlatform to the current TFM
#endif
    }
}
