// <copyright file="PermissionsModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Permissions;

public sealed class PermissionsModule : Module, IPermissionsModule
{
    private static readonly PermissionsJsonSerializerContext JsonContext = PermissionsJsonSerializerContext.Default;

    public async Task<SetPermissionResult> SetPermissionAsync(PermissionDescriptor descriptor, PermissionState state, string origin, SetPermissionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetPermissionCommandParameters(descriptor, state, origin, options?.EmbeddedOrigin, options?.UserContext);

        return await ExecuteCommandAsync(new SetPermissionCommand(@params), options, JsonContext.SetPermissionCommand, JsonContext.SetPermissionResult, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(SetPermissionCommand))]
[JsonSerializable(typeof(SetPermissionResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class PermissionsJsonSerializerContext : JsonSerializerContext;
