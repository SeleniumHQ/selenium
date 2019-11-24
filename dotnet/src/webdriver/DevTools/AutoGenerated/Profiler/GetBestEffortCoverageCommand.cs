namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Collect coverage data for the current isolate. The coverage data may be incomplete due to
    /// garbage collection.
    /// </summary>
    public sealed class GetBestEffortCoverageCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.getBestEffortCoverage";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetBestEffortCoverageCommandResponse : ICommandResponse<GetBestEffortCoverageCommandSettings>
    {
        /// <summary>
        /// Coverage data for the current isolate.
        ///</summary>
        [JsonProperty("result")]
        public ScriptCoverage[] Result
        {
            get;
            set;
        }
    }
}