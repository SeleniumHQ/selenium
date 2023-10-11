# Label of the template file to use.
_TEMPLATE = "//dotnet:AssemblyInfo.cs.template"

def _generated_assembly_info_impl(ctx):
    ctx.actions.expand_template(
        template = ctx.file.template,
        output = ctx.outputs.source_file,
        substitutions = {
            "{ASSEMBLY_VERSION}": ctx.attr.version,
            "{ASSEMBLY_COMPANY}": ctx.attr.company,
            "{ASSEMBLY_COPYRIGHT}": ctx.attr.copyright,
            "{ASSEMBLY_DESCRIPTION}": ctx.attr.description,
            "{ASSEMBLY_PRODUCT}": ctx.attr.product,
            "{ASSEMBLY_TITLE}": ctx.attr.title,
            "{ASSEMBLY_INFORMATIONAL_VERSION}": ctx.attr.informational_version,
        },
    )

generated_assembly_info = rule(
    implementation = _generated_assembly_info_impl,
    attrs = {
        "version": attr.string(mandatory = True),
        "company": attr.string(mandatory = True),
        "copyright": attr.string(mandatory = True),
        "description": attr.string(mandatory = True),
        "product": attr.string(mandatory = True),
        "title": attr.string(mandatory = True),
        "informational_version": attr.string(mandatory = True),
        "template": attr.label(
            default = Label(_TEMPLATE),
            allow_single_file = True,
        ),
    },
    outputs = {"source_file": "%{name}.AssemblyInfo.cs"},
)
