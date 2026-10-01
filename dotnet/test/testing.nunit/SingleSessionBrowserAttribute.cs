// <copyright file="SingleSessionBrowserAttribute.cs" company="Selenium Committers">
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
using NUnit.Framework.Internal;
using OpenQA.Selenium.Testing.NUnit.Environment;

namespace OpenQA.Selenium.Testing.NUnit;

/// <summary>
/// Runs the whole assembly sequentially when the active browser supports only one session at a time.
/// </summary>
/// <remarks>
/// An explicit NumberOfTestWorkers run setting takes precedence over this attribute.
/// </remarks>
[AttributeUsage(AttributeTargets.Assembly)]
public sealed class SingleSessionBrowserAttribute(params Browser[] browsers) : NUnitAttribute, IApplyToTest
{
    public IReadOnlyList<Browser> Browsers { get; } = browsers;

    public void ApplyToTest(Test test)
    {
        if (Browsers.Contains(EnvironmentManager.Instance.Browser))
        {
            // Zero workers makes NUnit use the sequential dispatcher, ignoring [Parallelizable].
            test.Properties.Set(PropertyNames.LevelOfParallelism, 0);
        }
    }
}
