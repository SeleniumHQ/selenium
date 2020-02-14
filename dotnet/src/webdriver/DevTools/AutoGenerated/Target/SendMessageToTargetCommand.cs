namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sends protocol message over session with given id.
    /// </summary>
    public sealed class SendMessageToTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.sendMessageToTarget";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the message
        /// </summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the session.
        /// </summary>
        [JsonProperty("sessionId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SessionId
        {
            get;
            set;
        }
        /// <summary>
        /// Deprecated.
        /// </summary>
        [JsonProperty("targetId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetId
        {
            get;
            set;
        }
    }

    public sealed class SendMessageToTargetCommandResponse : ICommandResponse<SendMessageToTargetCommandSettings>
    {
    }
}