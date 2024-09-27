using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Log;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(ConsoleLogEntry), "console")]
//[JsonDerivedType(typeof(JavascriptLogEntry), "javascript")]
public abstract record BaseLogEntry(BiDi BiDi, Level Level, Script.Source Source, string Text, DateTimeOffset Timestamp)
    : EventArgs(BiDi);

public record ConsoleLogEntry(BiDi BiDi, Level Level, Script.Source Source, string Text, DateTimeOffset Timestamp, string Method, IReadOnlyList<Script.RemoteValue> Args)
    : BaseLogEntry(BiDi, Level, Source, Text, Timestamp);

public record JavascriptLogEntry(BiDi BiDi, Level Level, Script.Source Source, string Text, DateTimeOffset Timestamp)
    : BaseLogEntry(BiDi, Level, Source, Text, Timestamp);

public enum Level
{
    Debug,
    Info,
    Warn,
    Error
}
