namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Clears the overridden Device Orientation.
    /// </summary>
    public sealed class ClearDeviceOrientationOverrideCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.clearDeviceOrientationOverride";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearDeviceOrientationOverrideCommandResponse : ICommandResponse<ClearDeviceOrientationOverrideCommandSettings>
    {
    }
}