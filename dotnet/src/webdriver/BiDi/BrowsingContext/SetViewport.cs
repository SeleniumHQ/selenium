// <copyright file="SetViewport.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed record SetViewportParameters(
    BrowsingContext? Context,
    [property: JsonConverter(typeof(OptionalConverter<Viewport?>))] Optional<Viewport?>? Viewport,
    [property: JsonConverter(typeof(OptionalConverter<double?>))] Optional<double?>? DevicePixelRatio,
    ImmutableArray<Browser.UserContext>? UserContexts)
    : Parameters;

public sealed record SetViewportOptions : CommandOptions
{
    public BrowsingContext? Context { get; init; }

    public Optional<Viewport?>? Viewport { get; init; }

    public Optional<double?>? DevicePixelRatio { get; init; }

    public ImmutableArray<Browser.UserContext>? UserContexts { get; init; }
}

public sealed record ContextSetViewportOptions : CommandOptions
{
    public Optional<Viewport?>? Viewport { get; init; }

    public Optional<double?>? DevicePixelRatio { get; init; }

    internal static SetViewportOptions WithContext(ContextSetViewportOptions? options, BrowsingContext context) => new()
    {
        Context = context,
        Viewport = options?.Viewport,
        DevicePixelRatio = options?.DevicePixelRatio,
        Timeout = options?.Timeout
    };
}

public readonly record struct Viewport(long Width, long Height);

public sealed record SetViewportResult : EmptyResult;
