namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Retrieves a list of available targets.
    /// </summary>
    public sealed class GetTargetsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.getTargets";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetTargetsCommandResponse : ICommandResponse<GetTargetsCommandSettings>
    {
        /// <summary>
        /// The list of targets.
        ///</summary>
        [JsonProperty("targetInfos")]
        public TargetInfo[] TargetInfos
        {
            get;
            set;
        }
    }
}