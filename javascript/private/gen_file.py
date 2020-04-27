import os
import sys

_copyright = """/*
 * Copyright 2011-2014 Software Freedom Conservancy
 *
 * Licensed under the Apache License, Version 2.0 (the \"License\");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an \"AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"""

def get_atom_name(name):
    # TODO: Convert camelCase and snake_case to BIG_SNAKE_CASE
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
        line_format = "    \"{}\",\n"
      else:
        line_format = "    L\"{}\",\n"
    elif "java" == lang:
        line_format = "      .append\(\"{}\")\n"
    else:
        raise RuntimeError("Unknown language: %s " % lang)

    name = get_atom_name(name)

    if "cc" == lang or "hh" == lang:
        string_type = "std::string" if utf8 else "std::wstring"
        char_type = "char" if utf8 else "wchar_t"
        out.write("const %s* const %s[] = {\n" % (char_type, name))
    elif "java" == lang:
        out.write("  %s(new StringBuilder()\n" % name)
    else:
        raise RuntimeError("Unknown language: %s " % lang)

    # Make the header file play nicely in a terminal: limit lines to 80
    # characters, but make sure we don't cut off a line in the middle
    # of an escape sequence.
    while len(contents) > 70:
        diff = 70
        while contents[diff-1] == "\\":
            diff = diff -1
        line = contents[0:diff]
        contents = contents[diff:]

        out.write(line_format.format(line))
    if len(contents) > 0:
        out.write(line_format.format(contents))

    if "cc" == lang or "hh" == lang:
        out.write("    NULL\n};\n\n")
    elif "java" == lang:
        out.write("      .toString()),\n")

def generate_header(file_name, out, js_map, just_declare, utf8):
    define_guard = "WEBDRIVER_%s" % os.path.basename(file_name.upper()).replace(".", "_")
    include_stddef = "" if utf8 else "\n#include <stddef.h>  // For wchar_t."
    out.write("""%s
    
/* AUTO GENERATED - DO NOT EDIT BY HAND */
#ifndef %s
#define %s
%s
#include <string>    // For std::(w)string.

namespace webdriver {
namespace atoms {
    
""" % (_copyright, define_guard, define_guard, include_stddef))

    string_type = "std::string" if utf8 else "std::wstring"
    char_type = "char" if utf8 else "wchar_t"
    
    for (name, file) in js_map.items():
        if just_declare:
            out.write("extern const %s* const %s[];\n" % (char_type, name.upper()))
        else:
            contents = open(file, "r").read()
            write_atom_literal(out, name, contents, "hh", utf8)

    out.write("""
static inline %s asString(const %s* const atom[]) {
  %s source;
  for (int i = 0; atom[i] != NULL; i++) {
    source += atom[i];
  }
  return source;
}

}  // namespace atoms
}  // namespace webdriver
    
#endif  // %s
""" % (string_type, char_type, string_type, define_guard))

def generate_cc_source(out, js_map, utf8):
    out.write("""%s

/* AUTO GENERATED - DO NOT EDIT BY HAND */

#include <stddef.h>  // For NULL.
#include "atoms.h"

namespace webdriver {
namespace atoms {
    
""" % _copyright)

    for (name, file) in js_map.items():
        contents = open(file, "r").read()
        write_atom_literal(out, name, contents, "cc", utf8)

    out.write("""
}  // namespace atoms
}  // namespace webdriver

""")

def generate_java_source(file_name, out, preamble, js_map):
    if not file_name.endswith(".java"):
        raise RuntimeError("File name must end in .java")
    class_name = os.path.basename(file_name[:-5])

    out.write(_copyright)
    out.write("\n")
    out.write(preamble)
    out.write("")
    out.write("""
public enum %s {

    // AUTO GENERATED - DO NOT EDIT BY HAND
""" % class_name)

    for (name, file) in js_map.items():
        contents = open(file, "r").read()
        write_atom_literal(out, name, contents, "java", True)

    out.write("""
  ;
  private final String value;

  public String getValue() {
    return value;
  }

  public String toString() {
    return getValue();
  }

  %s(String value) {
    this.value = value;
  }
}
""" % class_name)


def main(argv=[]):
    lang = argv[1]
    file_name = argv[2]
    preamble = argv[3]
    utf8 = (argv[4] == "true")

    js_map = {}
    for i in range(5, len(argv), 2):
        js_map[argv[i]] = argv[i + 1]

    with open(file_name, "w") as out:
        if "cc" == lang:
            generate_cc_source(out, js_map, utf8)
        elif "hdecl" == lang:
            generate_header(file_name, out, js_map, True, utf8)
        elif "hh" == lang:
            generate_header(file_name, out, js_map, False, utf8)
        elif "java" == lang:
            generate_java_source(file_name, out, preamble, js_map)
        else:
            raise RuntimeError("Unknown lang: %s" % lang)

if __name__ == "__main__":
    main(sys.argv)
