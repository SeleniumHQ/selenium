namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Toggles ignoring of service worker for each request.
    /// </summary>
    public sealed class SetBypassServiceWorkerCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setBypassServiceWorker";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Bypass service worker and load from network.
        /// </summary>
        [JsonProperty("bypass")]
        public bool Bypass
        {
            get;
            set;
        }
    }

    public sealed class SetBypassServiceWorkerCommandResponse : ICommandResponse<SetBypassServiceWorkerCommandSettings>
    {
    }
}