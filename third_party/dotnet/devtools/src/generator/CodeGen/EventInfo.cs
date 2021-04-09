namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol event.
    /// </summary>
    public sealed class EventInfo
    {
        public string EventName
        {
            get;
            set;
        }

        public string FullTypeName
        {
            get;
            set;
        }
    }
}
