namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Collect coverage data for the current isolate, and resets execution counters. Precise code
    /// coverage needs to have started.
    /// </summary>
    public sealed class TakePreciseCoverageCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.takePreciseCoverage";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class TakePreciseCoverageCommandResponse : ICommandResponse<TakePreciseCoverageCommandSettings>
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