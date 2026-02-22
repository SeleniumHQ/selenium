using OpenQA.Selenium.BiDi.Storage;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextStorageModule
{
    Task<DeleteCookiesResult> DeleteCookiesAsync(ContextDeleteCookiesOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetCookiesResult> GetCookiesAsync(ContextGetCookiesOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, ContextSetCookieOptions? options = null, CancellationToken cancellationToken = default);
}
