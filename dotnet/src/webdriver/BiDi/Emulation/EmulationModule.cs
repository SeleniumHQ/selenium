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
    public async Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setTimezoneOverride", @params, Default.SetTimezoneOverrideParameters, Default.SetTimezoneOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setUserAgentOverride", @params, Default.SetUserAgentOverrideParameters, Default.SetUserAgentOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetLocaleOverrideParameters(locale, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setLocaleOverride", @params, Default.SetLocaleOverrideParameters, Default.SetLocaleOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetMediaFeaturesOverrideResult> SetMediaFeaturesOverrideAsync(MediaFeatures? features, SetMediaFeaturesOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetMediaFeaturesOverrideParameters(features, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setMediaFeaturesOverride", @params, Default.SetMediaFeaturesOverrideParameters, Default.SetMediaFeaturesOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetForcedColorsModeThemeOverrideParameters(theme, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setForcedColorsModeThemeOverride", @params, Default.SetForcedColorsModeThemeOverrideParameters, Default.SetForcedColorsModeThemeOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScriptingEnabledParameters(enabled, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setScriptingEnabled", @params, Default.SetScriptingEnabledParameters, Default.SetScriptingEnabledResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenOrientationOverrideParameters(screenOrientation, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setScreenOrientationOverride", @params, Default.SetScreenOrientationOverrideParameters, Default.SetScreenOrientationOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenSettingsOverrideResult> SetScreenSettingsOverrideAsync(ScreenArea? screenArea, SetScreenSettingsOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenSettingsOverrideParameters(screenArea, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setScreenSettingsOverride", @params, Default.SetScreenSettingsOverrideParameters, Default.SetScreenSettingsOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideAsync(ScrollbarType? scrollbarType, SetScrollbarTypeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScrollbarTypeOverrideParameters(scrollbarType, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setScrollbarTypeOverride", @params, Default.SetScrollbarTypeOverrideParameters, Default.SetScrollbarTypeOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationOverrideAsync(GeolocationOverride? geolocationOverride, SetGeolocationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        SetGeolocationOverrideParameters @params = geolocationOverride switch
        {
            GeolocationCoordinatesOverride c => new SetGeolocationOverrideCoordinatesParameters(
                new GeolocationCoordinates(c.Latitude, c.Longitude, c.Accuracy, c.Altitude, c.AltitudeAccuracy, c.Heading, c.Speed),
                options?.Contexts, options?.UserContexts),
            GeolocationPositionErrorOverride => new SetGeolocationOverridePositionErrorParameters(
                new GeolocationPositionError(), options?.Contexts, options?.UserContexts),
            null => new SetGeolocationOverrideCoordinatesParameters(
                null, options?.Contexts, options?.UserContexts),
            _ => throw new ArgumentException($"Unknown geolocation override type: {geolocationOverride.GetType()}", nameof(geolocationOverride))
        };

        return await ExecuteAsync("emulation.setGeolocationOverride", @params, Default.SetGeolocationOverrideParameters, Default.SetGeolocationOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetTouchOverrideResult> SetTouchOverrideAsync(long? maxTouchPoints, SetTouchOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTouchOverrideParameters(maxTouchPoints, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setTouchOverride", @params, Default.SetTouchOverrideParameters, Default.SetTouchOverrideResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetNetworkConditionsResult> SetNetworkConditionsAsync(NetworkConditions? networkConditions, SetNetworkConditionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetNetworkConditionsParameters(networkConditions, options?.Contexts, options?.UserContexts);
        return await ExecuteAsync("emulation.setNetworkConditions", @params, Default.SetNetworkConditionsParameters, Default.SetNetworkConditionsResult, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(SetTimezoneOverrideParameters))]
[JsonSerializable(typeof(SetTimezoneOverrideResult))]
[JsonSerializable(typeof(SetUserAgentOverrideParameters))]
[JsonSerializable(typeof(SetUserAgentOverrideResult))]
[JsonSerializable(typeof(SetLocaleOverrideParameters))]
[JsonSerializable(typeof(SetLocaleOverrideResult))]
[JsonSerializable(typeof(SetMediaFeaturesOverrideParameters))]
[JsonSerializable(typeof(SetMediaFeaturesOverrideResult))]
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
