// <copyright file="mtp_shim.cs" company="Selenium Committers">
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

internal static class MicrosoftTestingPlatformEntryPoint
{
    public static async global::System.Threading.Tasks.Task<int> Main(string[] args)
    {
        global::Microsoft.Testing.Platform.Builder.ITestApplicationBuilder builder =
            await global::Microsoft.Testing.Platform.Builder.TestApplication.CreateBuilderAsync(args);

        global::NUnit.VisualStudio.TestAdapter.TestingPlatformAdapter.TestingPlatformBuilderHook.AddExtensions(builder, args);

        using global::Microsoft.Testing.Platform.Builder.ITestApplication app = await builder.BuildAsync();
        return await app.RunAsync();
    }
}
