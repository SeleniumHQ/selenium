// <copyright file="WebExtensionModule.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization;
using static OpenQA.Selenium.BiDi.WebExtension.WebExtensionJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.WebExtension;

internal sealed class WebExtensionModule : Module, IWebExtensionModule
{
    private static readonly Command<InstallParameters, InstallResult> InstallCommand = new(
        "webExtension.install", Default.InstallParameters, Default.InstallResult);

    private static readonly Command<UninstallParameters, UninstallResult> UninstallCommand = new(
        "webExtension.uninstall", Default.UninstallParameters, Default.UninstallResult);

    public async Task<InstallResult> InstallAsync(ExtensionData extensionData, InstallOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new InstallParameters(extensionData);

        return await ExecuteAsync(InstallCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<UninstallResult> UninstallAsync(Extension extension, UninstallOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new UninstallParameters(extension);

        return await ExecuteAsync(UninstallCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(InstallParameters))]
[JsonSerializable(typeof(InstallResult))]
[JsonSerializable(typeof(UninstallParameters))]
[JsonSerializable(typeof(UninstallResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class WebExtensionJsonSerializerContext : JsonSerializerContext;
