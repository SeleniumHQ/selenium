namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Clears browser cache.
    /// </summary>
    public sealed class ClearBrowserCacheCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.clearBrowserCache";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearBrowserCacheCommandResponse : ICommandResponse<ClearBrowserCacheCommandSettings>
    {
    }
}