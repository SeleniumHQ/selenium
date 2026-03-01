// <copyright file="GetCookiesCommand.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Storage;

internal sealed class GetCookiesCommand(GetCookiesParameters @params)
    : Command<GetCookiesParameters, GetCookiesResult>(@params, "storage.getCookies");

internal sealed record GetCookiesParameters(CookieFilter? Filter, PartitionDescriptor? Partition) : Parameters;

public sealed record GetCookiesOptions : CommandOptions
{
    public CookieFilter? Filter { get; init; }

    public PartitionDescriptor? Partition { get; init; }
}

public sealed record ContextGetCookiesOptions : CommandOptions
{
    public CookieFilter? Filter { get; init; }

    internal static GetCookiesOptions WithContext(ContextGetCookiesOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Filter = options?.Filter,
        Partition = new ContextPartitionDescriptor(context),
        Timeout = options?.Timeout
    };
}

public sealed record GetCookiesResult(IReadOnlyList<Network.Cookie> Cookies, PartitionKey PartitionKey) : EmptyResult;

public sealed record CookieFilter
{
    public string? Name { get; init; }

    public Network.BytesValue? Value { get; init; }

    public string? Domain { get; init; }

    public string? Path { get; init; }

    public long? Size { get; init; }

    public bool? HttpOnly { get; init; }

    public bool? Secure { get; init; }

    public Network.SameSite? SameSite { get; init; }

    public DateTimeOffset? Expiry { get; init; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ContextPartitionDescriptor), "context")]
[JsonDerivedType(typeof(StorageKeyPartitionDescriptor), "storageKey")]
public abstract record PartitionDescriptor;

public sealed record ContextPartitionDescriptor(BrowsingContext.BrowsingContext Context) : PartitionDescriptor;

public sealed record StorageKeyPartitionDescriptor : PartitionDescriptor
{
    public string? UserContext { get; init; }

    public string? SourceOrigin { get; init; }
}
