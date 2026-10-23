// <copyright file="NUnitConfigurationExtensions.cs" company="Selenium Committers">
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

using Microsoft.Extensions.Configuration;

namespace OpenQA.Selenium.Testing.NUnit.Environment;

/// <summary>
/// Adds NUnit test parameters to Microsoft configuration builders.
/// </summary>
public static class NUnitConfigurationExtensions
{
    /// <summary>
    /// Adds the current NUnit test parameters as an in-memory configuration source.
    /// </summary>
    /// <param name="builder">The configuration builder.</param>
    /// <returns>The configuration builder for chaining.</returns>
    public static IConfigurationBuilder AddNUnitParameters(this IConfigurationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        return builder.AddInMemoryCollection(TestContext.Parameters.Names.Select(
            name => new KeyValuePair<string, string>(name, TestContext.Parameters.Get(name))));
    }
}
