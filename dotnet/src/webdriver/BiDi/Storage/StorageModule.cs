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

using System.Text.Json.Serialization;
using static OpenQA.Selenium.BiDi.Storage.StorageJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Storage;

internal sealed class StorageModule : Module, IStorageModule
{
    private static readonly Command<GetCookiesParameters, GetCookiesResult> GetCookiesCommand = new(
        "storage.getCookies", Default.GetCookiesParameters, Default.GetCookiesResult);

    private static readonly Command<DeleteCookiesParameters, DeleteCookiesResult> DeleteCookiesCommand = new(
        "storage.deleteCookies", Default.DeleteCookiesParameters, Default.DeleteCookiesResult);

    private static readonly Command<SetCookieParameters, SetCookieResult> SetCookieCommand = new(
        "storage.setCookie", Default.SetCookieParameters, Default.SetCookieResult);

    public async Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetCookiesParameters(options?.Filter, options?.Partition);

        return await ExecuteAsync(GetCookiesCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<DeleteCookiesResult> DeleteCookiesAsync(DeleteCookiesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new DeleteCookiesParameters(options?.Filter, options?.Partition);

        return await ExecuteAsync(DeleteCookiesCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetCookieParameters(cookie, options?.Partition);

        return await ExecuteAsync(SetCookieCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(GetCookiesParameters))]
[JsonSerializable(typeof(GetCookiesResult))]
[JsonSerializable(typeof(SetCookieParameters))]
[JsonSerializable(typeof(SetCookieResult))]
[JsonSerializable(typeof(DeleteCookiesParameters))]
[JsonSerializable(typeof(DeleteCookiesResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class StorageJsonSerializerContext : JsonSerializerContext;
