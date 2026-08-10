import os
import sys
from pathlib import Path

from scripts.generated_note import generated_note

# Shared license body, copied next to this file by BUILD.bazel — see scripts/license_header.txt.
_LICENSE_NOTICE = (Path(__file__).parent / "license_header.txt").read_text(encoding="utf-8").rstrip("\n")
_LICENSE_BLOCK = "/*\n" + "\n".join(f" * {line}".rstrip() for line in _LICENSE_NOTICE.split("\n")) + "\n */"

_copyright = f"""{_LICENSE_BLOCK}
"""


# One C-style block comment serves every output language (C++ and Java both accept it).
def generated_note_block(label):
    raw = generated_note("", "javascript/private/gen_file.py", f"bazel build {label}")
    return "/*\n" + "\n".join(f" * {line}" for line in raw.split("\n")) + "\n */"


def get_atom_name(name):
    # We had a todo here to convert camelCase and snake_case to BIG_SNAKE_CASE, but this code
    # will be removed when BiDi is the default, so we're not going to bother with that.
    name = os.path.basename(name)
    return name.upper()


def write_atom_literal(out, name, contents, lang, utf8):
    # Escape the contents of the file so it can be stored as a literal.
    contents = contents.replace("\\", "\\\\")
    contents = contents.replace("\f", "\\f")
    contents = contents.replace("\n", "\\n")
    contents = contents.replace("\r", "\\r")
    contents = contents.replace("\t", "\\t")
    contents = contents.replace('"', '\\"')

    if "cc" == lang or "hh" == lang:
        if utf8:
            line_format = '    "{}",\n'
        else:
            line_format = '    L"{}",\n'
    elif "java" == lang:
        line_format = '      .append\\("{}")\n'
    else:
        raise RuntimeError(f"Unknown language: {lang} ")

    name = get_atom_name(name)

    if "cc" == lang or "hh" == lang:
        char_type = "char" if utf8 else "wchar_t"
        out.write(f"const {char_type}* const {name}[] = {{\n")
    elif "java" == lang:
        out.write(f"  {name}(new StringBuilder()\n")
    else:
        raise RuntimeError(f"Unknown language: {lang} ")

    # Make the header file play nicely in a terminal: limit lines to 80
    # characters, but make sure we don't cut off a line in the middle
    # of an escape sequence.
    while len(contents) > 70:
        diff = 70
        while contents[diff - 1] == "\\":
            diff = diff - 1
        line = contents[0:diff]
        contents = contents[diff:]

        out.write(line_format.format(line))
    if len(contents) > 0:
        out.write(line_format.format(contents))

    if "cc" == lang or "hh" == lang:
        out.write("    NULL\n};\n\n")
    elif "java" == lang:
        out.write("      .toString()),\n")


def generate_header(file_name, out, js_map, just_declare, utf8, note):
    define_guard = "WEBDRIVER_{}".format(os.path.basename(file_name.upper()).replace(".", "_"))
    include_stddef = "" if utf8 else "\n#include <stddef.h>  // For wchar_t."
    out.write(
        f"""{_copyright}

{note}
#ifndef {define_guard}
#define {define_guard}
{include_stddef}
#include <string>    // For std::(w)string.

namespace webdriver {{
namespace atoms {{

"""
    )

    string_type = "std::string" if utf8 else "std::wstring"
    char_type = "char" if utf8 else "wchar_t"

    for name, file in js_map.items():
        if just_declare:
            out.write(f"extern const {char_type}* const {name.upper()}[];\n")
        else:
            contents = open(file).read()
            write_atom_literal(out, name, contents, "hh", utf8)

    out.write(
        f"""
static inline {string_type} asString(const {char_type}* const atom[]) {{
  {string_type} source;
  for (int i = 0; atom[i] != NULL; i++) {{
    source += atom[i];
  }}
  return source;
}}

}}  // namespace atoms
}}  // namespace webdriver

#endif  // {define_guard}
"""
    )


def generate_cc_source(out, js_map, utf8, note):
    out.write(
        f"""{_copyright}

{note}

#include <stddef.h>  // For NULL.
#include "atoms.h"

namespace webdriver {{
namespace atoms {{

"""
    )

    for name, file in js_map.items():
        contents = open(file).read()
        write_atom_literal(out, name, contents, "cc", utf8)

    out.write("""
}  // namespace atoms
}  // namespace webdriver

""")


def generate_java_source(file_name, out, preamble, js_map, note):
    if not file_name.endswith(".java"):
        raise RuntimeError("File name must end in .java")
    class_name = os.path.basename(file_name[:-5])

    out.write(_copyright)
    out.write("\n")
    out.write(note)
    out.write("\n\n")
    out.write(preamble)
    out.write("")
    out.write(
        f"""
public enum {class_name} {{
"""
    )

    for name, file in js_map.items():
        contents = open(file).read()
        write_atom_literal(out, name, contents, "java", True)

    out.write(
        f"""
  ;
  private final String value;

  public String getValue() {{
    return value;
  }}

  public String toString() {{
    return getValue();
  }}

  {class_name}(String value) {{
    this.value = value;
  }}
}}
"""
    )


def main(argv=[]):
    lang = argv[1]
    file_name = argv[2]
    preamble = argv[3]
    utf8 = argv[4] == "true"
    note = generated_note_block(argv[5])

    js_map = {}
    for i in range(6, len(argv), 2):
        js_map[argv[i]] = argv[i + 1]

    with open(file_name, "w") as out:
        if "cc" == lang:
            generate_cc_source(out, js_map, utf8, note)
        elif "hdecl" == lang:
            generate_header(file_name, out, js_map, True, utf8, note)
        elif "hh" == lang:
            generate_header(file_name, out, js_map, False, utf8, note)
        elif "java" == lang:
            generate_java_source(file_name, out, preamble, js_map, note)
        else:
            raise RuntimeError(f"Unknown lang: {lang}")


if __name__ == "__main__":
    main(sys.argv)
