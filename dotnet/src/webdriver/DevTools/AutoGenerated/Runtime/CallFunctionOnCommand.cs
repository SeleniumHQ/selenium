namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Calls function with given declaration on the given object. Object group of the result is
    /// inherited from the target object.
    /// </summary>
    public sealed class CallFunctionOnCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.callFunctionOn";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Declaration of the function to call.
        /// </summary>
        [JsonProperty("functionDeclaration")]
        public string FunctionDeclaration
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the object to call function on. Either objectId or executionContextId should
        /// be specified.
        /// </summary>
        [JsonProperty("objectId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// Call arguments. All call arguments must belong to the same JavaScript world as the target
        /// object.
        /// </summary>
        [JsonProperty("arguments", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public CallArgument[] Arguments
        {
            get;
            set;
        }
        /// <summary>
        /// In silent mode exceptions thrown during evaluation are not reported and do not pause
        /// execution. Overrides `setPauseOnException` state.
        /// </summary>
        [JsonProperty("silent", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Silent
        {
            get;
            set;
        }
        /// <summary>
        /// Whether the result is expected to be a JSON object which should be sent by value.
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
        /// <summary>
        /// Whether execution should be treated as initiated by user in the UI.
        /// </summary>
        [JsonProperty("userGesture", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? UserGesture
        {
            get;
            set;
        }
        /// <summary>
        /// Whether execution should `await` for resulting value and return once awaited promise is
        /// resolved.
        /// </summary>
        [JsonProperty("awaitPromise", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? AwaitPromise
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies execution context which global object will be used to call function on. Either
        /// executionContextId or objectId should be specified.
        /// </summary>
        [JsonProperty("executionContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ExecutionContextId
        {
            get;
            set;
        }
        /// <summary>
        /// Symbolic group name that can be used to release multiple objects. If objectGroup is not
        /// specified and objectId is, objectGroup will be inherited from object.
        /// </summary>
        [JsonProperty("objectGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectGroup
        {
            get;
            set;
        }
    }

    public sealed class CallFunctionOnCommandResponse : ICommandResponse<CallFunctionOnCommandSettings>
    {
        /// <summary>
        /// Call result.
        ///</summary>
        [JsonProperty("result")]
        public RemoteObject Result
        {
            get;
            set;
        }
        /// <summary>
        /// Exception details.
        ///</summary>
        [JsonProperty("exceptionDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ExceptionDetails ExceptionDetails
        {
            get;
            set;
        }
    }
}