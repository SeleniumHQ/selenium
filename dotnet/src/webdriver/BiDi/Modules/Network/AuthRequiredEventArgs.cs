using System;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record AuthRequiredEventArgs(BiDi BiDi, BrowsingContext.BrowsingContext Context, bool IsBlocked, BrowsingContext.Navigation Navigation, ulong RedirectCount, RequestData Request, DateTimeOffset Timestamp, ResponseData Response) :
    BaseParametersEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp);
