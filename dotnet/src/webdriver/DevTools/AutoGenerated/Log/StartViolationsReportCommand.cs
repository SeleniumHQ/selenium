namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// start violation reporting.
    /// </summary>
    public sealed class StartViolationsReportCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Log.startViolationsReport";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Configuration for violations.
        /// </summary>
        [JsonProperty("config")]
        public ViolationSetting[] Config
        {
            get;
            set;
        }
    }

    public sealed class StartViolationsReportCommandResponse : ICommandResponse<StartViolationsReportCommandSettings>
    {
    }
}