namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Crashes GPU process.
    /// </summary>
    public sealed class CrashGpuProcessCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.crashGpuProcess";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CrashGpuProcessCommandResponse : ICommandResponse<CrashGpuProcessCommandSettings>
    {
    }
}