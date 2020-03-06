namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Generates a report for testing.
    /// </summary>
    public sealed class GenerateTestReportCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.generateTestReport";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Message to be displayed in the report.
        /// </summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies the endpoint group to deliver the report to.
        /// </summary>
        [JsonProperty("group", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Group
        {
            get;
            set;
        }
    }

    public sealed class GenerateTestReportCommandResponse : ICommandResponse<GenerateTestReportCommandSettings>
    {
    }
}