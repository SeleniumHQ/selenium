// <copyright file="StorageModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Storage;

public sealed class StorageModule : Module
{
    private StorageJsonSerializerContext _jsonContext = null!;

    public async Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null)
    {
        var @params = new GetCookiesParameters(options?.Filter, options?.Partition);

        return await Broker.ExecuteCommandAsync(new GetCookiesCommand(@params), options, _jsonContext.GetCookiesCommand, _jsonContext.GetCookiesResult).ConfigureAwait(false);
    }

    public async Task<DeleteCookiesResult> DeleteCookiesAsync(DeleteCookiesOptions? options = null)
    {
        var @params = new DeleteCookiesParameters(options?.Filter, options?.Partition);

        return await Broker.ExecuteCommandAsync(new DeleteCookiesCommand(@params), options, _jsonContext.DeleteCookiesCommand, _jsonContext.DeleteCookiesResult).ConfigureAwait(false);
    }

    public async Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null)
    {
        var @params = new SetCookieParameters(cookie, options?.Partition);

        return await Broker.ExecuteCommandAsync(new SetCookieCommand(@params), options, _jsonContext.SetCookieCommand, _jsonContext.SetCookieResult).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new BrowserUserContextConverter(BiDi));

        _jsonContext = new StorageJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(GetCookiesCommand))]
[JsonSerializable(typeof(GetCookiesResult))]
[JsonSerializable(typeof(SetCookieCommand))]
[JsonSerializable(typeof(SetCookieResult))]
[JsonSerializable(typeof(DeleteCookiesCommand))]
[JsonSerializable(typeof(DeleteCookiesResult))]

internal partial class StorageJsonSerializerContext : JsonSerializerContext;
