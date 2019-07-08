namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Requests that page scale factor is reset to initial values.
    /// </summary>
    public sealed class ResetPageScaleFactorCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.resetPageScaleFactor";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ResetPageScaleFactorCommandResponse : ICommandResponse<ResetPageScaleFactorCommandSettings>
    {
    }
}