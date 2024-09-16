using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Input;

internal class PerformActionsCommand(PerformActionsCommandParameters @params) : Command<PerformActionsCommandParameters>(@params);

internal record PerformActionsCommandParameters(BrowsingContext.BrowsingContext Context) : CommandParameters
{
    public IEnumerable<SourceActions>? Actions { get; set; }
}

public record PerformActionsOptions : CommandOptions
{
    public IEnumerable<SourceActions>? Actions { get; set; } = [];
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(KeySourceActions), "key")]
public abstract record SourceActions
{
    public static KeySourceActions Press(string text)
    {
        var keySourceActions = new KeySourceActions();

        foreach (var character in text)
        {
            keySourceActions.Actions.AddRange([
                new KeyDownAction(character.ToString()),
                new KeyUpAction(character.ToString())
                ]);
        }

        return keySourceActions;
    }
}

public record KeySourceActions : SourceActions
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public List<KeySourceAction> Actions { get; set; } = [];

    public new KeySourceActions Press(string text)
    {
        Actions.AddRange(SourceActions.Press(text).Actions);

        return this;
    }

    public KeySourceActions Pause(long? duration = null)
    {
        Actions.Add(new KeyPauseAction { Duration = duration });

        return this;
    }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(KeyPauseAction), "pause")]
[JsonDerivedType(typeof(KeyDownAction), "keyDown")]
[JsonDerivedType(typeof(KeyUpAction), "keyUp")]
public abstract record KeySourceAction;

public record KeyPauseAction : KeySourceAction
{
    public long? Duration { get; set; }
}

public record KeyDownAction(string Value) : KeySourceAction;

public record KeyUpAction(string Value) : KeySourceAction;
