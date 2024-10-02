using System.Collections.Generic;
using System.Text.Json.Serialization;
using System;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public abstract record BaseParametersEventArgs(BiDi BiDi, BrowsingContext.BrowsingContext Context, bool IsBlocked, BrowsingContext.Navigation Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp)
    : BrowsingContextEventArgs(BiDi, Context)
{
    [JsonInclude]
    public IReadOnlyList<Intercept>? Intercepts { get; internal set; }
}

