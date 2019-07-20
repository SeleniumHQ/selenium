namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the isolate id.
    /// </summary>
    public sealed class GetIsolateIdCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.getIsolateId";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetIsolateIdCommandResponse : ICommandResponse<GetIsolateIdCommandSettings>
    {
        /// <summary>
        /// The isolate id.
        ///</summary>
        [JsonProperty("id")]
        public string Id
        {
            get;
            set;
        }
    }
}