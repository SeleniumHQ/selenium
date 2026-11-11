from pathlib import Path

_TEMPLATE = (Path(__file__).parent / "generated_note_template.txt").read_text(encoding="utf-8").rstrip("\n")


def generated_note(comment_prefix, generator, command):
    """Render the standard two-line generated-file marker in the given comment style."""
    text = _TEMPLATE.format(generator=generator, command=command)
    prefix = f"{comment_prefix} " if comment_prefix else ""
    return "\n".join(f"{prefix}{line}".rstrip() for line in text.split("\n"))
