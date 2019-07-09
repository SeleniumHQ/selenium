namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Activates (focuses) the target.
    /// </summary>
    public sealed class ActivateTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.activateTarget";
        
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

    public sealed class ActivateTargetCommandResponse : ICommandResponse<ActivateTargetCommandSettings>
    {
    }
}