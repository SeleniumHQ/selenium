using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Input;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Keys), "key")]
[JsonDerivedType(typeof(Pointers), "pointer")]
public abstract record SourceActions
{
    public record Keys : SourceActions
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public List<Key> Actions { get; set; } = [];

        [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
        [JsonDerivedType(typeof(Pause), "pause")]
        [JsonDerivedType(typeof(Down), "keyDown")]
        [JsonDerivedType(typeof(Up), "keyUp")]
        public abstract record Key
        {
            public record Pause : Key
            {
                public long? Duration { get; set; }
            }

            public record Down(string Value) : Key;

            public record Up(string Value) : Key;
        }
    }

    public record Pointers : SourceActions
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public List<Pointer> Actions { get; set; } = [];

        [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
        [JsonDerivedType(typeof(Pause), "pause")]
        [JsonDerivedType(typeof(Down), "pointerDown")]
        [JsonDerivedType(typeof(Up), "pointerUp")]
        public abstract record Pointer
        {
            public record Pause : Pointer
            {
                public long? Duration { get; set; }
            }

            public record Down(string Value) : Pointer;

            public record Up(string Value) : Pointer;
        }
    }
}
