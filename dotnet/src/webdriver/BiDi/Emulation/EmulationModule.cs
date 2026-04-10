// <copyright file="EmulationModule.cs" company="Selenium Committers">
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
using static OpenQA.Selenium.BiDi.Emulation.EmulationJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Emulation;

internal sealed class EmulationModule : Module, IEmulationModule
{
    private static readonly Command<SetTimezoneOverrideParameters, SetTimezoneOverrideResult> SetTimezoneOverrideCommand = new(
        "emulation.setTimezoneOverride", Default.SetTimezoneOverrideParameters, Default.SetTimezoneOverrideResult);

    private static readonly Command<SetUserAgentOverrideParameters, SetUserAgentOverrideResult> SetUserAgentOverrideCommand = new(
        "emulation.setUserAgentOverride", Default.SetUserAgentOverrideParameters, Default.SetUserAgentOverrideResult);

    private static readonly Command<SetLocaleOverrideParameters, SetLocaleOverrideResult> SetLocaleOverrideCommand = new(
        "emulation.setLocaleOverride", Default.SetLocaleOverrideParameters, Default.SetLocaleOverrideResult);

    private static readonly Command<SetForcedColorsModeThemeOverrideParameters, SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideCommand = new(
        "emulation.setForcedColorsModeThemeOverride", Default.SetForcedColorsModeThemeOverrideParameters, Default.SetForcedColorsModeThemeOverrideResult);

    private static readonly Command<SetScriptingEnabledParameters, SetScriptingEnabledResult> SetScriptingEnabledCommand = new(
        "emulation.setScriptingEnabled", Default.SetScriptingEnabledParameters, Default.SetScriptingEnabledResult);

    private static readonly Command<SetScreenOrientationOverrideParameters, SetScreenOrientationOverrideResult> SetScreenOrientationOverrideCommand = new(
        "emulation.setScreenOrientationOverride", Default.SetScreenOrientationOverrideParameters, Default.SetScreenOrientationOverrideResult);

    private static readonly Command<SetScreenSettingsOverrideParameters, SetScreenSettingsOverrideResult> SetScreenSettingsOverrideCommand = new(
        "emulation.setScreenSettingsOverride", Default.SetScreenSettingsOverrideParameters, Default.SetScreenSettingsOverrideResult);

    private static readonly Command<SetScrollbarTypeOverrideParameters, SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideCommand = new(
        "emulation.setScrollbarTypeOverride", Default.SetScrollbarTypeOverrideParameters, Default.SetScrollbarTypeOverrideResult);

    private static readonly Command<SetGeolocationOverrideParameters, SetGeolocationOverrideResult> SetGeolocationOverrideCommand = new(
        "emulation.setGeolocationOverride", Default.SetGeolocationOverrideParameters, Default.SetGeolocationOverrideResult);

    private static readonly Command<SetTouchOverrideParameters, SetTouchOverrideResult> SetTouchOverrideCommand = new(
        "emulation.setTouchOverride", Default.SetTouchOverrideParameters, Default.SetTouchOverrideResult);

    private static readonly Command<SetNetworkConditionsParameters, SetNetworkConditionsResult> SetNetworkConditionsCommand = new(
        "emulation.setNetworkConditions", Default.SetNetworkConditionsParameters, Default.SetNetworkConditionsResult);

    public async Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetTimezoneOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetUserAgentOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetLocaleOverrideParameters(locale, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetLocaleOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetForcedColorsModeThemeOverrideParameters(theme, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetForcedColorsModeThemeOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScriptingEnabledParameters(enabled, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetScriptingEnabledCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenOrientationOverrideParameters(screenOrientation, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetScreenOrientationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenSettingsOverrideResult> SetScreenSettingsOverrideAsync(ScreenArea? screenArea, SetScreenSettingsOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenSettingsOverrideParameters(screenArea, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetScreenSettingsOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideAsync(ScrollbarType? scrollbarType, SetScrollbarTypeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScrollbarTypeOverrideParameters(scrollbarType, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetScrollbarTypeOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(double latitude, double longitude, SetGeolocationCoordinatesOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var coordinates = new GeolocationCoordinates(latitude, longitude, options?.Accuracy, options?.Altitude, options?.AltitudeAccuracy, options?.Heading, options?.Speed);
        var @params = new SetGeolocationOverrideCoordinatesParameters(coordinates, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(SetGeolocationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetGeolocationOverrideCoordinatesParameters(null, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationPositionErrorOverrideAsync(SetGeolocationPositionErrorOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetGeolocationOverridePositionErrorParameters(new GeolocationPositionError(), options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetTouchOverrideResult> SetTouchOverrideAsync(long? maxTouchPoints, SetTouchOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTouchOverrideParameters(maxTouchPoints, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetTouchOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetNetworkConditionsResult> SetNetworkConditionsAsync(NetworkConditions? networkConditions, SetNetworkConditionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetNetworkConditionsParameters(networkConditions, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync(SetNetworkConditionsCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(SetTimezoneOverrideParameters))]
[JsonSerializable(typeof(SetTimezoneOverrideResult))]
[JsonSerializable(typeof(SetUserAgentOverrideParameters))]
[JsonSerializable(typeof(SetUserAgentOverrideResult))]
[JsonSerializable(typeof(SetLocaleOverrideParameters))]
[JsonSerializable(typeof(SetLocaleOverrideResult))]
[JsonSerializable(typeof(SetForcedColorsModeThemeOverrideParameters))]
[JsonSerializable(typeof(SetForcedColorsModeThemeOverrideResult))]
[JsonSerializable(typeof(SetScriptingEnabledParameters))]
[JsonSerializable(typeof(SetScriptingEnabledResult))]
[JsonSerializable(typeof(SetScreenOrientationOverrideParameters))]
[JsonSerializable(typeof(SetScreenOrientationOverrideResult))]
[JsonSerializable(typeof(SetScreenSettingsOverrideParameters))]
[JsonSerializable(typeof(SetScreenSettingsOverrideResult))]
[JsonSerializable(typeof(SetScrollbarTypeOverrideParameters))]
[JsonSerializable(typeof(SetScrollbarTypeOverrideResult))]
[JsonSerializable(typeof(SetGeolocationOverrideParameters))]
[JsonSerializable(typeof(SetGeolocationOverrideResult))]
[JsonSerializable(typeof(SetTouchOverrideParameters))]
[JsonSerializable(typeof(SetTouchOverrideResult))]
[JsonSerializable(typeof(SetNetworkConditionsParameters))]
[JsonSerializable(typeof(SetNetworkConditionsResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class EmulationJsonSerializerContext : JsonSerializerContext;
