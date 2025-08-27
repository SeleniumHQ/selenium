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

using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Storage;

internal sealed class GetCookiesCommand(GetCookiesParameters @params)
    : Command<GetCookiesParameters, GetCookiesResult>(@params, "storage.getCookies");

internal sealed record GetCookiesParameters(CookieFilter? Filter, PartitionDescriptor? Partition) : Parameters;

public sealed class GetCookiesOptions : CommandOptions
{
    public CookieFilter? Filter { get; set; }

    public PartitionDescriptor? Partition { get; set; }
}

public sealed record GetCookiesResult : EmptyResult, IReadOnlyList<Network.Cookie>
{
    internal GetCookiesResult(IReadOnlyList<Network.Cookie> cookies, PartitionKey partitionKey)
    {
        Cookies = cookies;
        PartitionKey = partitionKey;
    }

    public IReadOnlyList<Network.Cookie> Cookies { get; }

    public PartitionKey PartitionKey { get; init; }

    public Network.Cookie this[int index] => Cookies[index];

    public int Count => Cookies.Count;

    public IEnumerator<Network.Cookie> GetEnumerator() => Cookies.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (Cookies as IEnumerable).GetEnumerator();
}

public sealed record CookieFilter
{
    public string? Name { get; set; }

    public Network.BytesValue? Value { get; set; }

    public string? Domain { get; set; }

    public string? Path { get; set; }

    public long? Size { get; set; }

    public bool? HttpOnly { get; set; }

    public bool? Secure { get; set; }

    public Network.SameSite? SameSite { get; set; }

    public DateTimeOffset? Expiry { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ContextPartitionDescriptor), "context")]
[JsonDerivedType(typeof(StorageKeyPartitionDescriptor), "storageKey")]
public abstract record PartitionDescriptor;

public sealed record ContextPartitionDescriptor(BrowsingContext.BrowsingContext Context) : PartitionDescriptor;

public sealed record StorageKeyPartitionDescriptor : PartitionDescriptor
{
    public string? UserContext { get; set; }

    public string? SourceOrigin { get; set; }
}
