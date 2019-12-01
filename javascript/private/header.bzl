_browser_names = [
    "android",
    "chrome",
    "firefox",
    "ie",
    "ios",
]

def _closure_lang_file_impl(ctx):
    binaries = {}
    suffixes = ["_%s" % n for n in _browser_names]

    for d in ctx.attr.deps:
        if getattr(d, "closure_js_binary", None):
            name = d.label.name.replace("-", "_")
            for suffix in suffixes:
                if name.endswith(suffix):
                    name = name[0:-len(suffix)]
            binaries.update({name: d.closure_js_binary.bin})

    args = ctx.actions.args()
    args.add(ctx.attr.lang)
    args.add(ctx.outputs.out)
    args.add(ctx.attr.preamble)
    args.add(ctx.attr.utf8)
    for key in sorted(binaries.keys()):
        args.add(key)
        args.add(binaries[key])

    ctx.actions.run(
        executable = ctx.executable._lang_gen,
        arguments = [args],
        inputs = binaries.values(),
        outputs = [
            ctx.outputs.out,
        ],
    )

    return [
        DefaultInfo(files = depset([ctx.outputs.out])),
    ]

closure_lang_file = rule(
    _closure_lang_file_impl,
    attrs = {
        "deps": attr.label_list(
            allow_empty = False,
            allow_files = False,
        ),
        "lang": attr.string(
            values = ["cc", "hdecl", "hh", "java"],
            mandatory = True,
        ),
        "preamble": attr.string(
            default = "",
        ),
        "out": attr.output(),
        "_lang_gen": attr.label(
            default = "//javascript/private:gen_file",
            executable = True,
            cfg = "host",
        ),
        "utf8": attr.bool(
          doc = "Generate utf8 or not. UTF8 with generate wstring and wchar_t." 
          + "If false, genereation with use char and string. Defaults to True",
          default = True,
        ),
    },
)
