namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disable precise code coverage. Disabling releases unnecessary execution count records and allows
    /// executing optimized code.
    /// </summary>
    public sealed class StopPreciseCoverageCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.stopPreciseCoverage";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopPreciseCoverageCommandResponse : ICommandResponse<StopPreciseCoverageCommandSettings>
    {
    }
}