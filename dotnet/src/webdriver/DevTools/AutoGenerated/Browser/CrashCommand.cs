namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Crashes browser on the main thread.
    /// </summary>
    public sealed class CrashCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.crash";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CrashCommandResponse : ICommandResponse<CrashCommandSettings>
    {
    }
}