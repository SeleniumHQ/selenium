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

using OpenQA.Selenium.BiDi.Json.Converters;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.WebExtension;

public sealed class WebExtensionModule : Module
{
    private WebExtensionJsonSerializerContext _jsonContext = null!;

    public async Task<InstallResult> InstallAsync(ExtensionData extensionData, InstallOptions? options = null)
    {
        var @params = new InstallParameters(extensionData);

        return await ExecuteCommandAsync(new InstallCommand(@params), options, _jsonContext.InstallCommand, _jsonContext.InstallResult).ConfigureAwait(false);
    }

    public async Task<UninstallResult> UninstallAsync(Extension extension, UninstallOptions? options = null)
    {
        var @params = new UninstallParameters(extension);

        return await ExecuteCommandAsync(new UninstallCommand(@params), options, _jsonContext.UninstallCommand, _jsonContext.UninstallResult).ConfigureAwait(false);
    }

    protected override void Initialize(BiDi bidi, JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new WebExtensionConverter(bidi));

        _jsonContext = new WebExtensionJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(InstallCommand))]
[JsonSerializable(typeof(InstallResult))]
[JsonSerializable(typeof(UninstallCommand))]
[JsonSerializable(typeof(UninstallResult))]

internal partial class WebExtensionJsonSerializerContext : JsonSerializerContext;
