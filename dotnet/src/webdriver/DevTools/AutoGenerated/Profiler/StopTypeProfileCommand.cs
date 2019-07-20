namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disable type profile. Disabling releases type profile data collected so far.
    /// </summary>
    public sealed class StopTypeProfileCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.stopTypeProfile";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopTypeProfileCommandResponse : ICommandResponse<StopTypeProfileCommandSettings>
    {
    }
}