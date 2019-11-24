namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable type profile.
    /// </summary>
    public sealed class StartTypeProfileCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.startTypeProfile";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StartTypeProfileCommandResponse : ICommandResponse<StartTypeProfileCommandSettings>
    {
    }
}