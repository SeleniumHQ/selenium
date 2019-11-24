namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Closes the target. If the target is a page that gets closed too.
    /// </summary>
    public sealed class CloseTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.closeTarget";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the targetId
        /// </summary>
        [JsonProperty("targetId")]
        public string TargetId
        {
            get;
            set;
        }
    }

    public sealed class CloseTargetCommandResponse : ICommandResponse<CloseTargetCommandSettings>
    {
        /// <summary>
        /// Gets or sets the success
        /// </summary>
        [JsonProperty("success")]
        public bool Success
        {
            get;
            set;
        }
    }
}