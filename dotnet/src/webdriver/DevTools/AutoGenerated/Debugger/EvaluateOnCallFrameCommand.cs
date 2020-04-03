namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Evaluates expression on a given call frame.
    /// </summary>
    public sealed class EvaluateOnCallFrameCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.evaluateOnCallFrame";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Call frame identifier to evaluate on.
        /// </summary>
        [JsonProperty("callFrameId")]
        public string CallFrameId
        {
            get;
            set;
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
        /// String object group name to put result into (allows rapid releasing resulting object handles
        /// using `releaseObjectGroup`).
        /// </summary>
        [JsonProperty("objectGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectGroup
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies whether command line API should be available to the evaluated expression, defaults
        /// to false.
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

    public sealed class EvaluateOnCallFrameCommandResponse : ICommandResponse<EvaluateOnCallFrameCommandSettings>
    {
        /// <summary>
        /// Object wrapper for the evaluation result.
        ///</summary>
        [JsonProperty("result")]
        public Runtime.RemoteObject Result
        {
            get;
            set;
        }
        /// <summary>
        /// Exception details.
        ///</summary>
        [JsonProperty("exceptionDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.ExceptionDetails ExceptionDetails
        {
            get;
            set;
        }
    }
}