namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Attaches to the browser target, only uses flat sessionId mode.
    /// </summary>
    public sealed class AttachToBrowserTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.attachToBrowserTarget";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class AttachToBrowserTargetCommandResponse : ICommandResponse<AttachToBrowserTargetCommandSettings>
    {
        /// <summary>
        /// Id assigned to the session.
        ///</summary>
        [JsonProperty("sessionId")]
        public string SessionId
        {
            get;
            set;
        }
    }
}