using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Input;

//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(Keys), "key")]
//[JsonDerivedType(typeof(Pointers), "pointer")]
public abstract record SourceActions
{
    public record Keys : SourceActions, IEnumerable<Keys.Key>
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public IList<Key> Actions { get; set; } = [];

        public void Add(Key key) => Actions.Add(key);

        public IEnumerator<Key> GetEnumerator() => Actions.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

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

    public record Pointers : SourceActions, IEnumerable<Pointers.Pointer>
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public Parameters? Options { get; set; }

        public IList<Pointer> Actions { get; set; } = [];

        public void Add(Pointer pointer) => Actions.Add(pointer);

        public IEnumerator<Pointer> GetEnumerator() => Actions.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

        public Pointers Click()
        {
            Add(new Pointer.Down(0));
            Add(new Pointer.Up(0));

            return this;
        }

        [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
        [JsonDerivedType(typeof(Pause), "pause")]
        [JsonDerivedType(typeof(Down), "pointerDown")]
        [JsonDerivedType(typeof(Up), "pointerUp")]
        [JsonDerivedType(typeof(Move), "pointerMove")]
        public abstract record Pointer
        {
            public record Pause : Pointer
            {
                public long? Duration { get; set; }
            }

            public record Down(int Button) : Pointer;

            public record Up(int Button) : Pointer;

            public record Move(int X, int Y) : Pointer
            {
                public int? Duration { get; set; }
            }
        }

        public record Parameters
        {
            public Type? PointerType { get; set; }
        }

        public enum Type
        {
            Mouse,
            Pen,
            Touch
        }
    }
}
