// <copyright file="SetCookie.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Storage;

internal sealed record SetCookieParameters(PartialCookie Cookie, PartitionDescriptor? Partition) : Parameters;

public sealed record PartialCookie(string Name, Network.BytesValue Value, string Domain)
{
    public string? Path { get; init; }

    public bool? HttpOnly { get; init; }

    public bool? Secure { get; init; }

    public Network.SameSite? SameSite { get; init; }

    [JsonConverter(typeof(DateTimeOffsetSecondsConverter))]
    public DateTimeOffset? Expiry { get; init; }
}

public sealed record SetCookieOptions : CommandOptions
{
    public PartitionDescriptor? Partition { get; init; }
}

public sealed record ContextSetCookieOptions : CommandOptions
{
    internal static SetCookieOptions WithContext(ContextSetCookieOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Partition = new ContextPartitionDescriptor(context),
        Timeout = options?.Timeout
    };
}

public sealed record SetCookieResult(PartitionKey PartitionKey) : EmptyResult;
