namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Releases all remote objects that belong to a given group.
    /// </summary>
    public sealed class ReleaseObjectGroupCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.releaseObjectGroup";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Symbolic object group name.
        /// </summary>
        [JsonProperty("objectGroup")]
        public string ObjectGroup
        {
            get;
            set;
        }
    }

    public sealed class ReleaseObjectGroupCommandResponse : ICommandResponse<ReleaseObjectGroupCommandSettings>
    {
    }
}