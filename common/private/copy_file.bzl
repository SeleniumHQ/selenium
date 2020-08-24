def copy_file(name, src, out = None, **kwargs):
    if out == None:
        out = src

    native.genrule(
        name = name,
        srcs = [src],
        outs = [out],
        cmd = "cp $< $@",
        **kwargs
    )
