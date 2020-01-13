namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Start
    /// </summary>
    public sealed class StartCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.start";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StartCommandResponse : ICommandResponse<StartCommandSettings>
    {
    }
}