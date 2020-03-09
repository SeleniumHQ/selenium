namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when all executionContexts were cleared in browser
    /// </summary>
    public sealed class ExecutionContextsClearedEventArgs : EventArgs
    {
    }
}