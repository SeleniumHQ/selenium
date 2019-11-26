namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets the requests to intercept that match the provided patterns and optionally resource types.
    /// </summary>
    public sealed class SetRequestInterceptionCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setRequestInterception";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Requests matching any of these patterns will be forwarded and wait for the corresponding
        /// continueInterceptedRequest call.
        /// </summary>
        [JsonProperty("patterns")]
        public RequestPattern[] Patterns
        {
            get;
            set;
        }
    }

    public sealed class SetRequestInterceptionCommandResponse : ICommandResponse<SetRequestInterceptionCommandSettings>
    {
    }
}