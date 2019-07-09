namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets a specified page scale factor.
    /// </summary>
    public sealed class SetPageScaleFactorCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setPageScaleFactor";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Page scale factor.
        /// </summary>
        [JsonProperty("pageScaleFactor")]
        public double PageScaleFactor
        {
            get;
            set;
        }
    }

    public sealed class SetPageScaleFactorCommandResponse : ICommandResponse<SetPageScaleFactorCommandSettings>
    {
    }
}