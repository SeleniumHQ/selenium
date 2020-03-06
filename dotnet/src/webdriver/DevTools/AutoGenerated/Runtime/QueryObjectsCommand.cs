namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// QueryObjects
    /// </summary>
    public sealed class QueryObjectsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.queryObjects";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the prototype to return objects for.
        /// </summary>
        [JsonProperty("prototypeObjectId")]
        public string PrototypeObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// Symbolic group name that can be used to release the results.
        /// </summary>
        [JsonProperty("objectGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectGroup
        {
            get;
            set;
        }
    }

    public sealed class QueryObjectsCommandResponse : ICommandResponse<QueryObjectsCommandSettings>
    {
        /// <summary>
        /// Array with objects.
        ///</summary>
        [JsonProperty("objects")]
        public RemoteObject Objects
        {
            get;
            set;
        }
    }
}