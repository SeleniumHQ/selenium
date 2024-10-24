using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record ResponseStartedEventArgs(BiDi BiDi, BrowsingContext.BrowsingContext Context, bool IsBlocked, Navigation Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, ResponseData Response)
    : BaseParametersEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp);
