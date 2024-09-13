using System.Text.Json;

namespace OpenQA.Selenium.BiDi.Communication;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(MessageSuccess), "success")]
//[JsonDerivedType(typeof(MessageError), "error")]
//[JsonDerivedType(typeof(MessageEvent), "event")]
internal abstract record Message;

internal record MessageSuccess(int Id, JsonElement Result) : Message;

internal record MessageError(int Id) : Message
{
    public string? Error { get; set; }

    public string? Message { get; set; }
}

internal record MessageEvent(string Method, JsonElement Params) : Message;
