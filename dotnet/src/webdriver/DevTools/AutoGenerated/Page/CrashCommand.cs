namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Crashes renderer on the IO thread, generates minidumps.
    /// </summary>
    public sealed class CrashCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.crash";
        
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