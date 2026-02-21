namespace OpenQA.Selenium.BiDi.Browser;

public interface IBrowserModule
{
    Task<CloseResult> CloseAsync(CloseOptions? options = null, CancellationToken cancellationToken = default);
    Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(string destinationFolder, SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetDownloadBehaviorResult> SetDownloadBehaviorDeniedAsync(SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default);
}
