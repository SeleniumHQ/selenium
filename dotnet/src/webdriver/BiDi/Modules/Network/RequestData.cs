using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record RequestData(Request Request, string Url, string Method, IReadOnlyList<Header> Headers, IReadOnlyList<Cookie> Cookies, long HeadersSize, long? BodySize, FetchTimingInfo Timings);
