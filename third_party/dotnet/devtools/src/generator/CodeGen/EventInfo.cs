namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol event.
    /// </summary>
    public sealed class EventInfo(string eventName, string fullTypeName)
    {
        public string EventName { get; } = eventName;

        public string FullTypeName { get; } = fullTypeName;
    }
}
