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
    Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetTouchOverrideResult> SetTouchOverrideAsync(long? maxTouchPoints, SetTouchOverrideOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null, CancellationToken cancellationToken = default);
}
