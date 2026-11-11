// <copyright file="SetMediaFeaturesOverride.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Emulation;

internal sealed record SetMediaFeaturesOverrideParameters(
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] MediaFeatures? Features,
    ImmutableArray<BrowsingContext.BrowsingContext>? Contexts,
    ImmutableArray<Browser.UserContext>? UserContexts)
    : Parameters;

public sealed record SetMediaFeaturesOverrideOptions : CommandOptions
{
    public ImmutableArray<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public ImmutableArray<Browser.UserContext>? UserContexts { get; init; }
}

public sealed record MediaFeatures
{
    [JsonPropertyName("any-hover")]
    [JsonConverter(typeof(OptionalConverter<AnyHover?>))]
    public Optional<AnyHover?>? AnyHover { get; init; }

    [JsonPropertyName("any-pointer")]
    [JsonConverter(typeof(OptionalConverter<AnyPointer?>))]
    public Optional<AnyPointer?>? AnyPointer { get; init; }

    [JsonPropertyName("color")]
    [JsonConverter(typeof(OptionalConverter<long?>))]
    public Optional<long?>? Color { get; init; }

    [JsonPropertyName("color-gamut")]
    [JsonConverter(typeof(OptionalConverter<ColorGamut?>))]
    public Optional<ColorGamut?>? ColorGamut { get; init; }

    [JsonPropertyName("color-index")]
    [JsonConverter(typeof(OptionalConverter<long?>))]
    public Optional<long?>? ColorIndex { get; init; }

    [JsonPropertyName("display-mode")]
    [JsonConverter(typeof(OptionalConverter<DisplayMode?>))]
    public Optional<DisplayMode?>? DisplayMode { get; init; }

    [JsonPropertyName("dynamic-range")]
    [JsonConverter(typeof(OptionalConverter<DynamicRange?>))]
    public Optional<DynamicRange?>? DynamicRange { get; init; }

    [JsonPropertyName("environment-blending")]
    [JsonConverter(typeof(OptionalConverter<EnvironmentBlending?>))]
    public Optional<EnvironmentBlending?>? EnvironmentBlending { get; init; }

    [JsonPropertyName("forced-colors")]
    [JsonConverter(typeof(OptionalConverter<ForcedColors?>))]
    public Optional<ForcedColors?>? ForcedColors { get; init; }

    [JsonPropertyName("grid")]
    [JsonConverter(typeof(OptionalConverter<Grid?>))]
    public Optional<Grid?>? Grid { get; init; }

    [JsonPropertyName("horizontal-viewport-segments")]
    [JsonConverter(typeof(OptionalConverter<long?>))]
    public Optional<long?>? HorizontalViewportSegments { get; init; }

    [JsonPropertyName("hover")]
    [JsonConverter(typeof(OptionalConverter<Hover?>))]
    public Optional<Hover?>? Hover { get; init; }

    [JsonPropertyName("inverted-colors")]
    [JsonConverter(typeof(OptionalConverter<InvertedColors?>))]
    public Optional<InvertedColors?>? InvertedColors { get; init; }

    [JsonPropertyName("monochrome")]
    [JsonConverter(typeof(OptionalConverter<long?>))]
    public Optional<long?>? Monochrome { get; init; }

    [JsonPropertyName("nav-controls")]
    [JsonConverter(typeof(OptionalConverter<NavControls?>))]
    public Optional<NavControls?>? NavControls { get; init; }

    [JsonPropertyName("overflow-block")]
    [JsonConverter(typeof(OptionalConverter<OverflowBlock?>))]
    public Optional<OverflowBlock?>? OverflowBlock { get; init; }

    [JsonPropertyName("overflow-inline")]
    [JsonConverter(typeof(OptionalConverter<OverflowInline?>))]
    public Optional<OverflowInline?>? OverflowInline { get; init; }

    [JsonPropertyName("pointer")]
    [JsonConverter(typeof(OptionalConverter<Pointer?>))]
    public Optional<Pointer?>? Pointer { get; init; }

    [JsonPropertyName("prefers-color-scheme")]
    [JsonConverter(typeof(OptionalConverter<PrefersColorScheme?>))]
    public Optional<PrefersColorScheme?>? PrefersColorScheme { get; init; }

    [JsonPropertyName("prefers-contrast")]
    [JsonConverter(typeof(OptionalConverter<PrefersContrast?>))]
    public Optional<PrefersContrast?>? PrefersContrast { get; init; }

    [JsonPropertyName("prefers-reduced-data")]
    [JsonConverter(typeof(OptionalConverter<PrefersReducedData?>))]
    public Optional<PrefersReducedData?>? PrefersReducedData { get; init; }

    [JsonPropertyName("prefers-reduced-motion")]
    [JsonConverter(typeof(OptionalConverter<PrefersReducedMotion?>))]
    public Optional<PrefersReducedMotion?>? PrefersReducedMotion { get; init; }

    [JsonPropertyName("prefers-reduced-transparency")]
    [JsonConverter(typeof(OptionalConverter<PrefersReducedTransparency?>))]
    public Optional<PrefersReducedTransparency?>? PrefersReducedTransparency { get; init; }

    [JsonPropertyName("scan")]
    [JsonConverter(typeof(OptionalConverter<Scan?>))]
    public Optional<Scan?>? Scan { get; init; }

    [JsonPropertyName("scripting")]
    [JsonConverter(typeof(OptionalConverter<Scripting?>))]
    public Optional<Scripting?>? Scripting { get; init; }

    [JsonPropertyName("update")]
    [JsonConverter(typeof(OptionalConverter<Update?>))]
    public Optional<Update?>? Update { get; init; }

    [JsonPropertyName("vertical-viewport-segments")]
    [JsonConverter(typeof(OptionalConverter<long?>))]
    public Optional<long?>? VerticalViewportSegments { get; init; }

    [JsonPropertyName("video-color-gamut")]
    [JsonConverter(typeof(OptionalConverter<VideoColorGamut?>))]
    public Optional<VideoColorGamut?>? VideoColorGamut { get; init; }

    [JsonPropertyName("video-dynamic-range")]
    [JsonConverter(typeof(OptionalConverter<VideoDynamicRange?>))]
    public Optional<VideoDynamicRange?>? VideoDynamicRange { get; init; }
}

[JsonConverter(typeof(KebabCaseEnumConverter<AnyHover>))]
public enum AnyHover
{
    None,
    Hover
}

[JsonConverter(typeof(KebabCaseEnumConverter<AnyPointer>))]
public enum AnyPointer
{
    None,
    Coarse,
    Fine
}

[JsonConverter(typeof(KebabCaseEnumConverter<ColorGamut>))]
public enum ColorGamut
{
    Srgb,
    P3,
    Rec2020
}

[JsonConverter(typeof(KebabCaseEnumConverter<DisplayMode>))]
public enum DisplayMode
{
    Fullscreen,
    Standalone,
    MinimalUi,
    Browser,
    PictureInPicture
}

[JsonConverter(typeof(KebabCaseEnumConverter<DynamicRange>))]
public enum DynamicRange
{
    Standard,
    High
}

[JsonConverter(typeof(KebabCaseEnumConverter<EnvironmentBlending>))]
public enum EnvironmentBlending
{
    Opaque,
    Additive,
    Subtractive
}

[JsonConverter(typeof(KebabCaseEnumConverter<ForcedColors>))]
public enum ForcedColors
{
    None,
    Active
}

public enum Grid
{
    Zero = 0,
    One = 1
}

[JsonConverter(typeof(KebabCaseEnumConverter<Hover>))]
public enum Hover
{
    None,
    Hover
}

[JsonConverter(typeof(KebabCaseEnumConverter<InvertedColors>))]
public enum InvertedColors
{
    None,
    Inverted
}

[JsonConverter(typeof(KebabCaseEnumConverter<NavControls>))]
public enum NavControls
{
    None,
    Back
}

[JsonConverter(typeof(KebabCaseEnumConverter<OverflowBlock>))]
public enum OverflowBlock
{
    None,
    Scroll,
    OptionalPaged,
    Paged
}

[JsonConverter(typeof(KebabCaseEnumConverter<OverflowInline>))]
public enum OverflowInline
{
    None,
    Scroll
}

[JsonConverter(typeof(KebabCaseEnumConverter<Pointer>))]
public enum Pointer
{
    None,
    Coarse,
    Fine
}

[JsonConverter(typeof(KebabCaseEnumConverter<PrefersColorScheme>))]
public enum PrefersColorScheme
{
    Light,
    Dark
}

[JsonConverter(typeof(KebabCaseEnumConverter<PrefersContrast>))]
public enum PrefersContrast
{
    NoPreference,
    More,
    Less,
    Custom
}

[JsonConverter(typeof(KebabCaseEnumConverter<PrefersReducedData>))]
public enum PrefersReducedData
{
    NoPreference,
    Reduce
}

[JsonConverter(typeof(KebabCaseEnumConverter<PrefersReducedMotion>))]
public enum PrefersReducedMotion
{
    NoPreference,
    Reduce
}

[JsonConverter(typeof(KebabCaseEnumConverter<PrefersReducedTransparency>))]
public enum PrefersReducedTransparency
{
    NoPreference,
    Reduce
}

[JsonConverter(typeof(KebabCaseEnumConverter<Scan>))]
public enum Scan
{
    Interlace,
    Progressive
}

[JsonConverter(typeof(KebabCaseEnumConverter<Scripting>))]
public enum Scripting
{
    None,
    InitialOnly,
    Enabled
}

[JsonConverter(typeof(KebabCaseEnumConverter<Update>))]
public enum Update
{
    None,
    Slow,
    Fast
}

[JsonConverter(typeof(KebabCaseEnumConverter<VideoColorGamut>))]
public enum VideoColorGamut
{
    Srgb,
    P3,
    Rec2020
}

[JsonConverter(typeof(KebabCaseEnumConverter<VideoDynamicRange>))]
public enum VideoDynamicRange
{
    Standard,
    High
}

public sealed record SetMediaFeaturesOverrideResult : EmptyResult;
