// <copyright file="Locator.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AccessibilityLocator), "accessibility")]
[JsonDerivedType(typeof(CssLocator), "css")]
[JsonDerivedType(typeof(ContextLocator), "context")]
[JsonDerivedType(typeof(InnerTextLocator), "innerText")]
[JsonDerivedType(typeof(XPathLocator), "xpath")]
public abstract record Locator;

public sealed record AccessibilityLocator(AccessibilityValue Value) : Locator;

public sealed record CssLocator(string Value) : Locator;

public sealed record ContextLocator(ContextValue Value) : Locator;

public sealed record InnerTextLocator(string Value) : Locator
{
    public bool? IgnoreCase { get; set; }

    public MatchType? MatchType { get; set; }

    public long? MaxDepth { get; set; }
}

public sealed record XPathLocator(string Value) : Locator;

public sealed record AccessibilityValue
{
    public string? Name { get; set; }
    public string? Role { get; set; }
}

public sealed record ContextValue(BrowsingContext Context);

public enum MatchType
{
    Full,
    Partial
}
