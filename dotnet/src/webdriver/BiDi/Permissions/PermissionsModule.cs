using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.Communication;
using OpenQA.Selenium.BiDi.Permissions;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Extensions.Permissions;

public class PermissionsModule : Module
{
    private PermissionsJsonSerializerContext JsonContext => (PermissionsJsonSerializerContext)base.JsonContext;

    public async Task SetPermissionAsync(string permissionName, PermissionState state, string origin, UserContext? userContext, SetPermissionOptions? options = null)
    {
        var @params = new SetPermissionCommandParameters(new PermissionDescriptor(permissionName), state, origin, userContext);

        await Broker.ExecuteCommandAsync(new SetPermissionCommand(@params), options, JsonContext.Permissions_SetPermissionCommand, JsonContext.Permissions_SetPermissionResult).ConfigureAwait(false);
    }

    protected override JsonSerializerContext Initialize(JsonSerializerOptions options)
    {
        return new PermissionsJsonSerializerContext(options);
    }
}

[JsonSerializable(typeof(SetPermissionCommand), TypeInfoPropertyName = "Permissions_SetPermissionCommand")]
[JsonSerializable(typeof(SetPermissionResult), TypeInfoPropertyName = "Permissions_SetPermissionResult")]
internal partial class PermissionsJsonSerializerContext : JsonSerializerContext;
