namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Stop violation reporting.
    /// </summary>
    public sealed class StopViolationsReportCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Log.stopViolationsReport";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopViolationsReportCommandResponse : ICommandResponse<StopViolationsReportCommandSettings>
    {
    }
}