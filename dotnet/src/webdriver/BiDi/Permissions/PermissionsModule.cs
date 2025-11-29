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

using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.Permissions;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Extensions.Permissions;

public class PermissionsModule : Module
{
    private PermissionsJsonSerializerContext JsonContext => (PermissionsJsonSerializerContext)base.JsonContext;

    public async Task SetPermissionAsync(string permissionName, PermissionState state, string origin, UserContext? userContext, SetPermissionOptions? options = null)
    {
        var @params = new SetPermissionCommandParameters(new PermissionDescriptor(permissionName), state, origin, userContext);

        await Broker.ExecuteCommandAsync(new SetPermissionCommand(@params), options, JsonContext.Permissions_SetPermissionCommand, JsonContext.Permissions_SetPermissionResult).ConfigureAwait(false);
    }

    protected override JsonSerializerContext CreateJsonContext(JsonSerializerOptions options)
    {
        return new PermissionsJsonSerializerContext(options);
    }
}

[JsonSerializable(typeof(SetPermissionCommand), TypeInfoPropertyName = "Permissions_SetPermissionCommand")]
[JsonSerializable(typeof(SetPermissionResult), TypeInfoPropertyName = "Permissions_SetPermissionResult")]
internal partial class PermissionsJsonSerializerContext : JsonSerializerContext;
