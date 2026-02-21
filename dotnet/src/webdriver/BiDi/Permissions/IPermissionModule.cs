namespace OpenQA.Selenium.BiDi.Permissions;

public interface IPermissionsModule
{
    Task<SetPermissionResult> SetPermissionAsync(PermissionDescriptor descriptor, PermissionState state, string origin, SetPermissionOptions? options = null, CancellationToken cancellationToken = default);
}
