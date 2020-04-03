namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns information about a target.
    /// </summary>
    public sealed class GetTargetInfoCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.getTargetInfo";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the targetId
        /// </summary>
        [JsonProperty("targetId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetId
        {
            get;
            set;
        }
    }

    public sealed class GetTargetInfoCommandResponse : ICommandResponse<GetTargetInfoCommandSettings>
    {
        /// <summary>
        /// Gets or sets the targetInfo
        /// </summary>
        [JsonProperty("targetInfo")]
        public TargetInfo TargetInfo
        {
            get;
            set;
        }
    }
}