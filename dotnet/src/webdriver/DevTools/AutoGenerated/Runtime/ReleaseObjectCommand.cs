namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Releases remote object with given id.
    /// </summary>
    public sealed class ReleaseObjectCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.releaseObject";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the object to release.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
    }

    public sealed class ReleaseObjectCommandResponse : ICommandResponse<ReleaseObjectCommandSettings>
    {
    }
}