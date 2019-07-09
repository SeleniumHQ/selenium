namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Add handler to promise with given promise object id.
    /// </summary>
    public sealed class AwaitPromiseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.awaitPromise";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the promise.
        /// </summary>
        [JsonProperty("promiseObjectId")]
        public string PromiseObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// Whether the result is expected to be a JSON object that should be sent by value.
        /// </summary>
        [JsonProperty("returnByValue", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? ReturnByValue
        {
            get;
            set;
        }
        /// <summary>
        /// Whether preview should be generated for the result.
        /// </summary>
        [JsonProperty("generatePreview", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? GeneratePreview
        {
            get;
            set;
        }
    }

    public sealed class AwaitPromiseCommandResponse : ICommandResponse<AwaitPromiseCommandSettings>
    {
        /// <summary>
        /// Promise result. Will contain rejected value if promise was rejected.
        ///</summary>
        [JsonProperty("result")]
        public RemoteObject Result
        {
            get;
            set;
        }
        /// <summary>
        /// Exception details if stack strace is available.
        ///</summary>
        [JsonProperty("exceptionDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ExceptionDetails ExceptionDetails
        {
            get;
            set;
        }
    }
}