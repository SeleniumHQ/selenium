load("//java/private:common.bzl", "MavenInfo", "explode_coordinates", "read_coordinates")
load("//java/private:module.bzl", "JavaModuleInfo")

DistInfo = provider(
    fields = {
        "target": "Label that this info was derived from",
        "name": "The name by which this target is known, which may be derived from maven coordinates",
        "binary_jars": "The binary jars associated with this target",
        "source_jars": "The source jars associated with this target",
    },
)

DistZipInfo = provider(
    fields = {
        "dist_infos": "Depset of transitive DistInfos",
    },
)

_ATTR_ASPECTS = [
    "deps",
    "exports",
    "runtime_deps",
]

def _name(coordinates, default):
    if not coordinates:
        return default
    exploded = explode_coordinates(coordinates)
    return exploded[1] + "-" + exploded[2]

def _dist_aspect_impl(target, ctx):
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])

    all_deps = deps + exports + rt_deps
    transitive_infos = [d[DistZipInfo].dist_infos for d in all_deps]

    name = None
    binary_jars = []
    source_jars = []

    if MavenInfo in target and target[MavenInfo].coordinates:
        name = _name(target[MavenInfo].coordinates, None)
        binary_jars = target[MavenInfo].artifact_jars
        source_jars = target[MavenInfo].source_jars
    elif JavaModuleInfo in target and target[JavaModuleInfo].name:
        coordinates = read_coordinates(ctx.rule.attr.tags)
        name = _name(coordinates, target[JavaModuleInfo].name)
        binary_jars = target[JavaInfo].runtime_output_jars
        source_jars = target[JavaInfo].source_jars
    elif JavaInfo in target:
        coordinates = read_coordinates(ctx.rule.attr.tags)
        if coordinates:
            name = _name(coordinates, None)
            binary_jars = target[JavaInfo].runtime_output_jars
            source_jars = target[JavaInfo].source_jars

    if len(binary_jars) > 1:
        fail("Unsure how to handle expanding binary jars for " + target)
    if len(source_jars) > 1:
        fail("Unsure how to handle expanding source jars for " + target)

    current = DistInfo(
        target = str(target.label),
        name = name,
        binary_jars = depset(binary_jars),
        source_jars = depset(source_jars),
    )

    return [
        DistZipInfo(
            dist_infos = depset([current], transitive = transitive_infos),
        ),
    ]

dist_aspect = aspect(
    _dist_aspect_impl,
    attr_aspects = _ATTR_ASPECTS,
    provides = [
        DistZipInfo,
    ],
    required_aspect_providers = [
        [JavaInfo],
        [JavaInfo, JavaModuleInfo],
        [MavenInfo],
    ],
)

def _is_third_party(prefixes, target):
    for prefix in prefixes:
        if target.startswith(prefix):
            return True
    return False

def separate_first_and_third_party(third_party_prefixes, dist_zip_infos):
    combined = depset(transitive = [i.dist_infos for i in dist_zip_infos])

    first_party = []
    third_party = []

    for dist_zip_info in combined.to_list():
        if not dist_zip_info.name:
            continue
        if _is_third_party(third_party_prefixes, dist_zip_info.target):
            third_party.append(dist_zip_info)
        else:
            first_party.append(dist_zip_info)

    return (first_party, third_party)
