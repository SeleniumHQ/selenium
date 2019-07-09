namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Resumes JavaScript execution.
    /// </summary>
    public sealed class ResumeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.resume";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ResumeCommandResponse : ICommandResponse<ResumeCommandSettings>
    {
    }
}