namespace OpenQA.Selenium.DevTools.Emulation
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Notification sent after the virtual time budget for the current VirtualTimePolicy has run out.
    /// </summary>
    public sealed class VirtualTimeBudgetExpiredEventArgs : EventArgs
    {
    }
}