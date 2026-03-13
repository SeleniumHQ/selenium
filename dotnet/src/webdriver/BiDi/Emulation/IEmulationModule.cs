// <copyright file="IEmulationModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Emulation;

public interface IEmulationModule
{
    Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(double latitude, double longitude, SetGeolocationCoordinatesOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(SetGeolocationOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetGeolocationOverrideResult> SetGeolocationPositionErrorOverrideAsync(SetGeolocationPositionErrorOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetNetworkConditionsResult> SetNetworkConditionsAsync(NetworkConditions? networkConditions, SetNetworkConditionsOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetScreenSettingsOverrideResult> SetScreenSettingsOverrideAsync(ScreenArea? screenArea, SetScreenSettingsOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetScrollbarTypeOverrideResult> SetScrollbarTypeOverrideAsync(ScrollbarType? scrollbarType, SetScrollbarTypeOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetTouchOverrideResult> SetTouchOverrideAsync(long? maxTouchPoints, SetTouchOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null, CancellationToken cancellationToken = default);
}
