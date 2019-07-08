namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Creates an isolated world for the given frame.
    /// </summary>
    public sealed class CreateIsolatedWorldCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.createIsolatedWorld";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the frame in which the isolated world should be created.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// An optional name which is reported in the Execution Context.
        /// </summary>
        [JsonProperty("worldName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string WorldName
        {
            get;
            set;
        }
        /// <summary>
        /// Whether or not universal access should be granted to the isolated world. This is a powerful
        /// option, use with caution.
        /// </summary>
        [JsonProperty("grantUniveralAccess", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? GrantUniveralAccess
        {
            get;
            set;
        }
    }

    public sealed class CreateIsolatedWorldCommandResponse : ICommandResponse<CreateIsolatedWorldCommandSettings>
    {
        /// <summary>
        /// Execution context of the isolated world.
        ///</summary>
        [JsonProperty("executionContextId")]
        public long ExecutionContextId
        {
            get;
            set;
        }
    }
}