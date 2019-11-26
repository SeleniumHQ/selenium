namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Evaluates expression on global object.
    /// </summary>
    public sealed class EvaluateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.evaluate";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Expression to evaluate.
        /// </summary>
        [JsonProperty("expression")]
        public string Expression
        {
            get;
            set;
        }
        /// <summary>
        /// Symbolic group name that can be used to release multiple objects.
        /// </summary>
        [JsonProperty("objectGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectGroup
        {
            get;
            set;
        }
        /// <summary>
        /// Determines whether Command Line API should be available during the evaluation.
        /// </summary>
        [JsonProperty("includeCommandLineAPI", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IncludeCommandLineAPI
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
        /// Specifies in which execution context to perform evaluation. If the parameter is omitted the
        /// evaluation will be performed in the context of the inspected page.
        /// </summary>
        [JsonProperty("contextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ContextId
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
        /// Whether to throw an exception if side effect cannot be ruled out during evaluation.
        /// </summary>
        [JsonProperty("throwOnSideEffect", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? ThrowOnSideEffect
        {
            get;
            set;
        }
        /// <summary>
        /// Terminate execution after timing out (number of milliseconds).
        /// </summary>
        [JsonProperty("timeout", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Timeout
        {
            get;
            set;
        }
    }

    public sealed class EvaluateCommandResponse : ICommandResponse<EvaluateCommandSettings>
    {
        /// <summary>
        /// Evaluation result.
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