namespace OpenQA.Selenium.BiDi.Modules.Network;

public record FetchTimingInfo(double TimeOrigin,
                              double RequestTime,
                              double RedirectStart,
                              double RedirectEnd,
                              double FetchStart,
                              double DnsStart,
                              double DnsEnd,
                              double ConnectStart,
                              double ConnectEnd,
                              double TlsStart,
                              double RequestStart,
                              double ResponseStart,
                              double ResponseEnd);
