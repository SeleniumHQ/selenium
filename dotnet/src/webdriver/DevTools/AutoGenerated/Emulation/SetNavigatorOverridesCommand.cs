namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Overrides value returned by the javascript navigator object.
    /// </summary>
    public sealed class SetNavigatorOverridesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setNavigatorOverrides";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The platform navigator.platform should return.
        /// </summary>
        [JsonProperty("platform")]
        public string Platform
        {
            get;
            set;
        }
    }

    public sealed class SetNavigatorOverridesCommandResponse : ICommandResponse<SetNavigatorOverridesCommandSettings>
    {
    }
}