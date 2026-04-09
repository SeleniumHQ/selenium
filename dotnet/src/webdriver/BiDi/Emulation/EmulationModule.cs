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
    private static readonly CommandDescriptor<SetTimezoneOverrideParameters, SetTimezoneOverrideResult> SetTimezoneOverrideCommand = new(
        "emulation.setTimezoneOverride", Default.CommandMessageSetTimezoneOverrideParameters, Default.SetTimezoneOverrideResult);

    private static readonly CommandDescriptor<SetUserAgentOverrideParameters, SetUserAgentOverrideResult> SetUserAgentOverrideCommand = new(
        "emulation.setUserAgentOverride", Default.CommandMessageSetUserAgentOverrideParameters, Default.SetUserAgentOverrideResult);

    private static readonly CommandDescriptor<SetLocaleOverrideParameters, SetLocaleOverrideResult> SetLocaleOverrideCommand = new(
        "emulation.setLocaleOverride", Default.CommandMessageSetLocaleOverrideParameters, Default.SetLocaleOverrideResult);

    private static readonly CommandDescriptor<SetForcedColorsModeThemeOverrideParameters, SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideCommand = new(
        "emulation.setForcedColorsModeThemeOverride", Default.CommandMessageSetForcedColorsModeThemeOverrideParameters, Default.SetForcedColorsModeThemeOverrideResult);

    private static readonly CommandDescriptor<SetScriptingEnabledParameters, SetScriptingEnabledResult> SetScriptingEnabledCommand = new(
        "emulation.setScriptingEnabled", Default.CommandMessageSetScriptingEnabledParameters, Default.SetScriptingEnabledResult);

    private static readonly CommandDescriptor<SetScreenOrientationOverrideParameters, SetScreenOrientationOverrideResult> SetScreenOrientationOverrideCommand = new(
        "emulation.setScreenOrientationOverride", Default.CommandMessageSetScreenOrientationOverrideParameters, Default.SetScreenOrientationOverrideResult);

    private static readonly CommandDescriptor<SetScreenSettingsOverrideParameters, SetScreenSettingsOverrideResult> SetScreenSettingsOverrideCommand = new(
        "emulation.setScreenSettingsOverride", Default.CommandMessageSetScreenSettingsOverrideParameters, Default.SetScreenSettingsOverrideResult);

    private static readonly CommandDescriptor<SetScrollbarTypeOverrideParameters, SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideCommand = new(
        "emulation.setScrollbarTypeOverride", Default.CommandMessageSetScrollbarTypeOverrideParameters, Default.SetScrollbarTypeOverrideResult);

    private static readonly CommandDescriptor<SetGeolocationOverrideParameters, SetGeolocationOverrideResult> SetGeolocationOverrideCommand = new(
        "emulation.setGeolocationOverride", Default.CommandMessageSetGeolocationOverrideParameters, Default.SetGeolocationOverrideResult);

    private static readonly CommandDescriptor<SetTouchOverrideParameters, SetTouchOverrideResult> SetTouchOverrideCommand = new(
        "emulation.setTouchOverride", Default.CommandMessageSetTouchOverrideParameters, Default.SetTouchOverrideResult);

    private static readonly CommandDescriptor<SetNetworkConditionsParameters, SetNetworkConditionsResult> SetNetworkConditionsCommand = new(
        "emulation.setNetworkConditions", Default.CommandMessageSetNetworkConditionsParameters, Default.SetNetworkConditionsResult);

    public async Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetTimezoneOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetUserAgentOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetLocaleOverrideParameters(locale, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetLocaleOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetForcedColorsModeThemeOverrideParameters(theme, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetForcedColorsModeThemeOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScriptingEnabledParameters(enabled, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetScriptingEnabledCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenOrientationOverrideParameters(screenOrientation, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetScreenOrientationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScreenSettingsOverrideResult> SetScreenSettingsOverrideAsync(ScreenArea? screenArea, SetScreenSettingsOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScreenSettingsOverrideParameters(screenArea, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetScreenSettingsOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideAsync(ScrollbarType? scrollbarType, SetScrollbarTypeOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetScrollbarTypeOverrideParameters(scrollbarType, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetScrollbarTypeOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(double latitude, double longitude, SetGeolocationCoordinatesOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var coordinates = new GeolocationCoordinates(latitude, longitude, options?.Accuracy, options?.Altitude, options?.AltitudeAccuracy, options?.Heading, options?.Speed);
        var @params = new SetGeolocationOverrideCoordinatesParameters(coordinates, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(SetGeolocationOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetGeolocationOverrideCoordinatesParameters(null, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationPositionErrorOverrideAsync(SetGeolocationPositionErrorOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetGeolocationOverridePositionErrorParameters(new GeolocationPositionError(), options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetGeolocationOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetTouchOverrideResult> SetTouchOverrideAsync(long? maxTouchPoints, SetTouchOverrideOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetTouchOverrideParameters(maxTouchPoints, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetTouchOverrideCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetNetworkConditionsResult> SetNetworkConditionsAsync(NetworkConditions? networkConditions, SetNetworkConditionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetNetworkConditionsParameters(networkConditions, options?.Contexts, options?.UserContexts);
        return await ExecuteCommandAsync(SetNetworkConditionsCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(CommandMessage<SetTimezoneOverrideParameters>))]
[JsonSerializable(typeof(SetTimezoneOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetUserAgentOverrideParameters>))]
[JsonSerializable(typeof(SetUserAgentOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetLocaleOverrideParameters>))]
[JsonSerializable(typeof(SetLocaleOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetForcedColorsModeThemeOverrideParameters>))]
[JsonSerializable(typeof(SetForcedColorsModeThemeOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetScriptingEnabledParameters>))]
[JsonSerializable(typeof(SetScriptingEnabledResult))]
[JsonSerializable(typeof(CommandMessage<SetScreenOrientationOverrideParameters>))]
[JsonSerializable(typeof(SetScreenOrientationOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetScreenSettingsOverrideParameters>))]
[JsonSerializable(typeof(SetScreenSettingsOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetScrollbarTypeOverrideParameters>))]
[JsonSerializable(typeof(SetScrollbarTypeOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetGeolocationOverrideParameters>))]
[JsonSerializable(typeof(SetGeolocationOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetTouchOverrideParameters>))]
[JsonSerializable(typeof(SetTouchOverrideResult))]
[JsonSerializable(typeof(CommandMessage<SetNetworkConditionsParameters>))]
[JsonSerializable(typeof(SetNetworkConditionsResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class EmulationJsonSerializerContext : JsonSerializerContext;
