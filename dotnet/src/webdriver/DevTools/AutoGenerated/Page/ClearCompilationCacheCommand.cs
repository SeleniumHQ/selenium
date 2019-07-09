namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Clears seeded compilation cache.
    /// </summary>
    public sealed class ClearCompilationCacheCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.clearCompilationCache";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearCompilationCacheCommandResponse : ICommandResponse<ClearCompilationCacheCommandSettings>
    {
    }
}