namespace OpenQA.Selenium.BiDi.Storage;

public interface IStorageModule
{
    Task<DeleteCookiesResult> DeleteCookiesAsync(DeleteCookiesOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null, CancellationToken cancellationToken = default);
}
