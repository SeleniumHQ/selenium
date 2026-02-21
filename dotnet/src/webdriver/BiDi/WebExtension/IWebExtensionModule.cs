namespace OpenQA.Selenium.BiDi.WebExtension;

public interface IWebExtensionModule
{
    Task<InstallResult> InstallAsync(ExtensionData extensionData, InstallOptions? options = null, CancellationToken cancellationToken = default);
    Task<UninstallResult> UninstallAsync(Extension extension, UninstallOptions? options = null, CancellationToken cancellationToken = default);
}
