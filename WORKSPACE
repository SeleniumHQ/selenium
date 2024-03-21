workspace(
    name = "selenium",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_java",
    sha256 = "16bc94b1a3c64f2c36ceecddc9e09a643e80937076b97e934b96a8f715ed1eaa",
    urls = [
        "https://github.com/bazelbuild/rules_java/releases/download/6.5.2/rules_java-6.5.2.tar.gz",
    ],
)

load("@rules_java//java:repositories.bzl", "rules_java_dependencies", "rules_java_toolchains")

rules_java_dependencies()

rules_java_toolchains()

http_archive(
    name = "apple_rules_lint",
    sha256 = "7c3cc45a95e3ef6fbc484a4234789a027e11519f454df63cbb963ac499f103f9",
    strip_prefix = "apple_rules_lint-0.3.2",
    url = "https://github.com/apple/apple_rules_lint/archive/refs/tags/0.3.2.tar.gz",
)

load("@apple_rules_lint//lint:repositories.bzl", "lint_deps")

lint_deps()

load("@apple_rules_lint//lint:setup.bzl", "lint_setup")

# Add your linters here.
lint_setup({
    "java-spotbugs": "//java:spotbugs-config",
    "rust-rustfmt": "//rust:enable-rustfmt",
})

http_archive(
    name = "bazel_skylib",
    sha256 = "66ffd9315665bfaafc96b52278f57c7e2dd09f5ede279ea6d39b2be471e7e3aa",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.4.2/bazel-skylib-1.4.2.tar.gz",
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.4.2/bazel-skylib-1.4.2.tar.gz",
    ],
)

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

http_archive(
    name = "aspect_bazel_lib",
    sha256 = "f75d03783588e054899eb0729a97fb5b8973c1a26f30373fafd485c90bf207d1",
    strip_prefix = "bazel-lib-2.4.2",
    url = "https://github.com/aspect-build/bazel-lib/releases/download/v2.4.2/bazel-lib-v2.4.2.tar.gz",
)

load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies", "aspect_bazel_lib_register_toolchains")

aspect_bazel_lib_dependencies()

aspect_bazel_lib_register_toolchains()

http_archive(
    name = "rules_python",
    sha256 = "c68bdc4fbec25de5b5493b8819cfc877c4ea299c0dcb15c244c5a00208cde311",
    strip_prefix = "rules_python-0.31.0",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.31.0/rules_python-0.31.0.tar.gz",
)

load("@rules_python//python:repositories.bzl", "py_repositories", "python_register_multi_toolchains")

py_repositories()

default_python_version = "3.8"

python_register_multi_toolchains(
    name = "python",
    default_version = default_python_version,
    ignore_root_user_error = True,
    python_versions = [
        "3.8",
        "3.9",
        "3.10",
        "3.11",
    ],
)

load("@python//:pip.bzl", "multi_pip_parse")
load("@python//3.10:defs.bzl", interpreter_3_10 = "interpreter")
load("@python//3.11:defs.bzl", interpreter_3_11 = "interpreter")
load("@python//3.8:defs.bzl", interpreter_3_8 = "interpreter")
load("@python//3.9:defs.bzl", interpreter_3_9 = "interpreter")

multi_pip_parse(
    name = "py_dev_requirements",
    default_version = default_python_version,
    python_interpreter_target = {
        "3.11": interpreter_3_11,
        "3.10": interpreter_3_10,
        "3.9": interpreter_3_9,
        "3.8": interpreter_3_8,
    },
    requirements_lock = {
        "3.11": "//py:requirements_lock.txt",
        "3.10": "//py:requirements_lock.txt",
        "3.9": "//py:requirements_lock.txt",
        "3.8": "//py:requirements_lock.txt",
    },
)

load("@py_dev_requirements//:requirements.bzl", "install_deps")

install_deps()

# This gets us a pre-compiled `protoc`
http_archive(
    name = "rules_proto",
    sha256 = "dc3fb206a2cb3441b485eb1e423165b231235a1ea9b031b4433cf7bc1fa460dd",
    strip_prefix = "rules_proto-5.3.0-21.7",
    urls = [
        "https://github.com/bazelbuild/rules_proto/archive/refs/tags/5.3.0-21.7.tar.gz",
    ],
)

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

# The go rules are often a dependency of _something_, so loading the version
# we want early
http_archive(
    name = "io_bazel_rules_go",
    sha256 = "6b65cb7917b4d1709f9410ffe00ecf3e160edf674b78c54a894471320862184f",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.39.0/rules_go-v0.39.0.zip",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.39.0/rules_go-v0.39.0.zip",
    ],
)

load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")

go_rules_dependencies()

go_register_toolchains(version = "1.19.3")

http_archive(
    name = "rules_jvm_external",
    patch_args = [
        "-p1",
    ],
    patches = [
        "//java:rules_jvm_external_javadoc.patch",
    ],
    sha256 = "85fd6bad58ac76cc3a27c8e051e4255ff9ccd8c92ba879670d195622e7c0a9b7",
    strip_prefix = "rules_jvm_external-6.0",
    url = "https://github.com/bazelbuild/rules_jvm_external/releases/download/6.0/rules_jvm_external-6.0.tar.gz",
)

load("@rules_jvm_external//:repositories.bzl", "rules_jvm_external_deps")

rules_jvm_external_deps()

load("@rules_jvm_external//:setup.bzl", "rules_jvm_external_setup")

rules_jvm_external_setup()

http_archive(
    name = "contrib_rules_jvm",
    sha256 = "4d62589dc6a55e74bbe33930b826d593367fc777449a410604b2ad7c6c625ef7",
    strip_prefix = "rules_jvm-0.19.0",
    url = "https://github.com/bazel-contrib/rules_jvm/releases/download/v0.19.0/rules_jvm-v0.19.0.tar.gz",
)

load("@contrib_rules_jvm//:repositories.bzl", "contrib_rules_jvm_deps")

contrib_rules_jvm_deps()

load("@contrib_rules_jvm//:setup.bzl", "contrib_rules_jvm_setup")

contrib_rules_jvm_setup()

load("//java:maven_deps.bzl", "selenium_java_deps")

selenium_java_deps()

load("@maven//:defs.bzl", "pinned_maven_install")

pinned_maven_install()

# Stop `aspect_rules_js` and `rules_dotnet` from fighting over `aspect_bazel_lib`
http_archive(
    name = "aspect_bazel_lib",
    sha256 = "4d6010ca5e3bb4d7045b071205afa8db06ec11eb24de3f023d74d77cca765f66",
    strip_prefix = "bazel-lib-1.39.0",
    url = "https://github.com/aspect-build/bazel-lib/releases/download/v1.39.0/bazel-lib-v1.39.0.tar.gz",
)

http_archive(
    name = "rules_dotnet",
    sha256 = "d01b0f44e58224deeb8ac81afe8701385d41b16c8028709d3a4ed5b46f1c48a0",
    strip_prefix = "rules_dotnet-0.14.0",
    url = "https://github.com/bazelbuild/rules_dotnet/releases/download/v0.14.0/rules_dotnet-v0.14.0.tar.gz",
)

load(
    "@rules_dotnet//dotnet:repositories.bzl",
    "dotnet_register_toolchains",
    "rules_dotnet_dependencies",
)

rules_dotnet_dependencies()

dotnet_register_toolchains("dotnet", "7.0.400")

load("@rules_dotnet//dotnet:paket.rules_dotnet_nuget_packages.bzl", "rules_dotnet_nuget_packages")

rules_dotnet_nuget_packages()

load("@rules_dotnet//dotnet:paket.paket2bazel_dependencies.bzl", "paket2bazel_dependencies")

paket2bazel_dependencies()

load("//dotnet:paket.bzl", "paket")

paket()

http_archive(
    name = "rules_rust",
    sha256 = "50ec4b84a7ec5370f5882d52f4a1e6b8a75de2f8dcc0a4403747b69b2c4ef5b1",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.23.0/rules_rust-v0.23.0.tar.gz"],
)

load("@rules_rust//rust:repositories.bzl", "rules_rust_dependencies", "rust_register_toolchains")

rules_rust_dependencies()

rust_register_toolchains(
    edition = "2021",
    versions = [
        "1.76.0",
    ],
)

load("@rules_rust//crate_universe:defs.bzl", "crates_repository")

crates_repository(
    name = "crates",
    cargo_lockfile = "//rust:Cargo.lock",
    lockfile = "//rust:Cargo.Bazel.lock",
    manifests = ["//rust:Cargo.toml"],
)

load("@crates//:defs.bzl", "crate_repositories")

crate_repositories()

http_archive(
    name = "aspect_rules_js",
    sha256 = "a2f941e27f02e84521c2d47fd530c66d57dd6d6e44b4a4f1496fe304851d8e48",
    strip_prefix = "rules_js-1.35.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.35.0/rules_js-v1.35.0.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = "18.17.0",
)

load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    data = [
        "@//:package.json",
        "@//:pnpm-workspace.yaml",
        "@//javascript/grid-ui:package.json",
        "@//javascript/node/selenium-webdriver:package.json",
    ],
    generate_bzl_library_targets = True,
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    update_pnpm_lock = True,
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()

http_archive(
    name = "aspect_rules_ts",
    sha256 = "bd3e7b17e677d2b8ba1bac3862f0f238ab16edb3e43fb0f0b9308649ea58a2ad",
    strip_prefix = "rules_ts-2.1.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v2.1.0/rules_ts-v2.1.0.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    ts_version = "4.9.5",
)

load("@bazel_features//:deps.bzl", "bazel_features_deps")

bazel_features_deps()

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "999349afef62875301f45ec8515189ceaf2e85b1e67a17e2d28b95b30e1d6c0b",
    strip_prefix = "rules_esbuild-0.18.0",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.18.0/rules_esbuild-v0.18.0.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

# Register a toolchain containing esbuild npm package and native bindings
load("@aspect_rules_esbuild//esbuild:repositories.bzl", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = "0.19.9",
)

http_archive(
    name = "io_bazel_rules_closure",
    patch_args = [
        "-p1",
    ],
    patches = [
        "//javascript:rules_closure_shell.patch",
    ],
    sha256 = "d66deed38a0bb20581c15664f0ab62270af5940786855c7adc3087b27168b529",
    strip_prefix = "rules_closure-0.11.0",
    urls = [
        "https://github.com/bazelbuild/rules_closure/archive/0.11.0.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:repositories.bzl", "rules_closure_dependencies", "rules_closure_toolchains")

rules_closure_dependencies()

rules_closure_toolchains()

http_archive(
    name = "rules_pkg",
    sha256 = "8f9ee2dc10c1ae514ee599a8b42ed99fa262b757058f65ad3c384289ff70c4b8",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
    ],
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

http_archive(
    name = "rules_oci",
    sha256 = "db57efd706f01eb3ce771468366baa1614b5b25f4cce99757e2b8d942155b8ec",
    strip_prefix = "rules_oci-1.0.0",
    url = "https://github.com/bazel-contrib/rules_oci/releases/download/v1.0.0/rules_oci-v1.0.0.tar.gz",
)

load("@rules_oci//oci:dependencies.bzl", "rules_oci_dependencies")

rules_oci_dependencies()

load("@rules_oci//oci:repositories.bzl", "LATEST_CRANE_VERSION", "oci_register_toolchains")

oci_register_toolchains(
    name = "oci",
    crane_version = LATEST_CRANE_VERSION,
    # Uncommenting the zot toolchain will cause it to be used instead of crane for some tasks.
    # Note that it does not support docker-format images.
    # zot_version = LATEST_ZOT_VERSION,
)

load("@rules_oci//oci:pull.bzl", "oci_pull")

# Examine https://console.cloud.google.com/gcr/images/distroless/GLOBAL/java?gcrImageListsize=30 to find
# the latest version when updating
oci_pull(
    name = "java_image_base",
    digest = "sha256:161a1d97d592b3f1919801578c3a47c8e932071168a96267698f4b669c24c76d",
    image = "gcr.io/distroless/java17",
)

oci_pull(
    name = "firefox_standalone",
    digest = "sha256:b6d8279268b3183d0d33e667e82fec1824298902f77718764076de763673124f",
    registry = "index.docker.io",
    repository = "selenium/standalone-firefox",
)

oci_pull(
    name = "chrome_standalone",
    digest = "sha256:1b809a961a0a77787a7cccac74ddc5570b7e89747f925b8469ddb9a6624d4ece",
    registry = "index.docker.io",
    repository = "selenium/standalone-chrome",
)

load("//common:selenium_manager.bzl", "selenium_manager")

selenium_manager()

load("//common:repositories.bzl", "pin_browsers")

pin_browsers()

http_archive(
    name = "rules_ruby",
    sha256 = "9ff781fd8180c2be8b3ab0f16d1d88d618c3b1bc4d502dcb914591886da40014",
    strip_prefix = "rules_ruby-0.8.1",
    url = "https://github.com/bazel-contrib/rules_ruby/releases/download/v0.8.1/rules_ruby-v0.8.1.tar.gz",
)

load(
    "@rules_ruby//ruby:deps.bzl",
    "rb_bundle_fetch",
    "rb_register_toolchains",
)

rb_register_toolchains(
    version_file = "//:rb/.ruby-version",
)

rb_bundle_fetch(
    name = "bundle",
    srcs = [
        "//:rb/lib/selenium/devtools/version.rb",
        "//:rb/lib/selenium/webdriver/version.rb",
        "//:rb/selenium-devtools.gemspec",
        "//:rb/selenium-webdriver.gemspec",
    ],
    gem_checksums = {
        "abbrev-0.1.2": "ad1b4eaaaed4cb722d5684d63949e4bde1d34f2a95e20db93aecfe7cbac74242",
        "activesupport-7.1.3": "fbfc137f1ab0e3909bd3de3e2a965245abf0381a2a7e283fa766cee6f5e0f927",
        "addressable-2.8.6": "798f6af3556641a7619bad1dce04cdb6eb44b0216a991b0396ea7339276f2b47",
        "ast-2.4.2": "1e280232e6a33754cde542bc5ef85520b74db2aac73ec14acef453784447cc12",
        "base64-0.2.0": "0f25e9b21a02a0cc0cea8ef92b2041035d39350946e8789c562b2d1a3da01507",
        "bigdecimal-3.1.6": "bcbc27d449cf8ed1b1814d21308f49c9d22ce73e33fff0d228e38799c02eab01",
        "bigdecimal-3.1.6-java": "2ef0e13a578e2411123254273f8b34c47ff9d45de91a6f64465fb217de8d5d04",
        "concurrent-ruby-1.2.3": "82fdd3f8a0816e28d513e637bb2b90a45d7b982bdf4f3a0511722d2e495801e2",
        "connection_pool-2.4.1": "0f40cf997091f1f04ff66da67eabd61a9fe0d4928b9a3645228532512fab62f4",
        "crack-1.0.0": "c83aefdb428cdc7b66c7f287e488c796f055c0839e6e545fec2c7047743c4a49",
        "csv-3.2.8": "2f5e11e8897040b97baf2abfe8fa265b314efeb8a9b7f756db9ebcf79e7db9fe",
        "debug-1.9.1": "86f1a6d4a299184f1a1f7ae4c2fe80f178beed55cdf608f83b49d7bdefa3ffda",
        "diff-lcs-1.5.1": "273223dfb40685548436d32b4733aa67351769c7dea621da7d9dd4813e63ddfe",
        "drb-2.2.0": "e9e4af1cded3306cfe37e064a0086e302d5f40df9cb4d161d059a6bb3a75d40f",
        "ffi-1.16.3": "6d3242ff10c87271b0675c58d68d3f10148fabc2ad6da52a18123f06078871fb",
        "ffi-1.16.3-x64-mingw32": "6ec709011e3955e97033fa77907a8ab89a9150137d4c45c82c77399b909c9259",
        "fileutils-1.7.2": "36a0fb324218263e52b486ad7408e9a295378fe8edc9fd343709e523c0980631",
        "git-1.19.1": "b0a422d9f6517353c48a330d6114de4db9e0c82dbe7202964a1d9f1fbc827d70",
        "hashdiff-1.1.0": "b5465f0e7375f1ee883f53a766ece4dbc764b7674a7c5ffd76e79b2f5f6fc9c9",
        "i18n-1.14.1": "9d03698903547c060928e70a9bc8b6b87fda674453cda918fc7ab80235ae4a61",
        "io-console-0.7.2": "f0dccff252f877a4f60d04a4dc6b442b185ebffb4b320ab69212a92b48a7a221",
        "io-console-0.7.2-java": "73aa382f8832b116613ceaf57b8ff5bf73dfedcaf39f0aa5420e10f63a4543ed",
        "irb-1.11.2": "a05f07e81d32dc79d78b0019283b9877463da0d40253774d1fe89f9586ae1cb9",
        "jar-dependencies-0.4.1": "b2df2f1ecbff15334ce20ea7fdd5b8d8161faab67761ff72c7647d728e40d387",
        "json-2.7.1": "187ea312fb58420ff0c40f40af1862651d4295c8675267c6a1c353f1a0ac3265",
        "json-2.7.1-java": "bfd628c0f8357058c2cf848febfa6f140f70f94ec492693a31a0a1933038a61b",
        "language_server-protocol-3.17.0.3": "3d5c58c02f44a20d972957a9febe386d7e7468ab3900ce6bd2b563dd910c6b3f",
        "listen-3.8.0": "9679040ac6e7845ad9f19cf59ecde60861c78e2fae57a5c20fe35e94959b2f8f",
        "logger-1.6.0": "0ab7c120262dd8de2a18cb8d377f1f318cbe98535160a508af9e7710ff43ef3e",
        "minitest-5.22.2": "c5a5003fc2114a3fde506e87f377f32a0882b41d944d7b90cf4cd1f781dbc718",
        "mutex_m-0.2.0": "b6ef0c6c842ede846f2ec0ade9e266b1a9dac0bc151682b04835e8ebd54840d5",
        "parallel-1.24.0": "5bf38efb9b37865f8e93d7a762727f8c5fc5deb19949f4040c76481d5eee9397",
        "parser-3.3.0.5": "7748313e505ca87045dc0465c776c802043f777581796eb79b1654c5d19d2687",
        "psych-5.1.2": "337322f58fc2bf24827d2b9bd5ab595f6a72971867d151bb39980060ea40a368",
        "psych-5.1.2-java": "1dd68dc609eddbc884e6892e11da942e16f7256bd30ebde9d35449d43043a6fe",
        "public_suffix-5.0.4": "35cd648e0d21d06b8dce9331d19619538d1d898ba6d56a6f2258409d2526d1ae",
        "racc-1.7.3": "b785ab8a30ec43bce073c51dbbe791fd27000f68d1c996c95da98bf685316905",
        "racc-1.7.3-java": "b2ad737e788cfa083263ce7c9290644bb0f2c691908249eb4f6eb48ed2815dbf",
        "rack-2.2.8": "7b83a1f1304a8f5554c67bc83632d29ecd2ed1daeb88d276b7898533fde22d97",
        "rainbow-3.1.1": "039491aa3a89f42efa1d6dec2fc4e62ede96eb6acd95e52f1ad581182b79bc6a",
        "rake-13.1.0": "be6a3e1aa7f66e6c65fa57555234eb75ce4cf4ada077658449207205474199c6",
        "rb-fsevent-0.11.2": "43900b972e7301d6570f64b850a5aa67833ee7d87b458ee92805d56b7318aefe",
        "rb-inotify-0.10.1": "050062d4f31d307cca52c3f6a7f4b946df8de25fc4bd373e1a5142e41034a7ca",
        "rbs-3.4.4": "1376d2604a00832641bb47521595e63a1c0d1cc241ded383ba48ddb4396de5a8",
        "rchardet-1.8.0": "693acd5253d5ade81a51940697955f6dd4bb2f0d245bda76a8e23deec70a52c7",
        "rdoc-6.6.2": "f763dbec81079236bcccded19d69680471bd55da8f731ea6f583d019dacd9693",
        "regexp_parser-2.9.0": "81a00ba141cec0d4b4bf58cb80cd9193e5180836d3fa6ef623f7886d3ba8bdd9",
        "reline-0.4.2": "14042962b71d4cf52cc7d348f411886e2df54fc9d434d69b0b0bff84786d1c3a",
        "rexml-3.2.6": "e0669a2d4e9f109951cb1fde723d8acd285425d81594a2ea929304af50282816",
        "rspec-3.13.0": "d490914ac1d5a5a64a0e1400c1d54ddd2a501324d703b8cfe83f458337bab993",
        "rspec-core-3.13.0": "557792b4e88da883d580342b263d9652b6a10a12d5bda9ef967b01a48f15454c",
        "rspec-expectations-3.13.0": "621d48c62262f955421eaa418130744760802cad47e781df70dba4d9f897102e",
        "rspec-mocks-3.13.0": "735a891215758d77cdb5f4721fffc21078793959d1f0ee4a961874311d9b7f66",
        "rspec-support-3.13.0": "0e725f53b8c20ce75913a5da7bf06bf90698266951f3b1e3ae7bcd9612775257",
        "rubocop-1.60.2": "000da0bffba2da48efdab233b13085afc3fabad2aa17ef0470cbaa0fd7cbc76c",
        "rubocop-ast-1.30.0": "faad6452b1018fee0dd9e21a44445908e94ee2a4435932a9dae0e0740b6349b3",
        "rubocop-capybara-2.20.0": "2a6844b942921f230ee3ab8c94fe77f41a9406096a140245270c0e11624bb938",
        "rubocop-factory_bot-2.25.1": "62751bde7af789878b8a31cbd2a82e69515ce7b23a2ad1820cb0fcc3e0150134",
        "rubocop-performance-1.20.2": "1bb1fa8c427fac7ba3c8dd2decb9860f23cb2d6c40350bedc88538de8875c731",
        "rubocop-rspec-2.26.1": "da00a2794c35c6df9d013621fe9d8340ef9717dba746eb4aa69f414d86e74458",
        "ruby-progressbar-1.13.0": "80fc9c47a9b640d6834e0dc7b3c94c9df37f08cb072b7761e4a71e22cff29b33",
        "ruby2_keywords-0.0.5": "ffd13740c573b7301cf7a2e61fc857b2a8e3d3aff32545d6f8300d8bae10e3ef",
        "rubyzip-2.3.2": "3f57e3935dc2255c414484fbf8d673b4909d8a6a57007ed754dde39342d2373f",
        "securerandom-0.3.1": "98f0450c0ea46d2f9a4b6db4f391dbd83dc08049592eada155739f40e0341bde",
        "steep-1.5.3": "7c6302a4d5932d0a46176ebc79766e52b853c223a85525aa2f8911e345123b85",
        "stringio-3.1.0": "c1f6263ae03a15025e51194ab19b06b15e06adcaaedb7f5f6c06ab60f5d67718",
        "strscan-3.1.0": "01b8a81d214fbf7b5308c6fb51b5972bbfc4a6aa1f166fd3618ba97e0fcd5555",
        "strscan-3.1.0-java": "8645aa76e017e21764c6df572d2d79fcc1672284014f5bdbd806278cdbcd11b0",
        "terminal-table-3.0.2": "f951b6af5f3e00203fb290a669e0a85c5dd5b051b3b023392ccfd67ba5abae91",
        "tzinfo-2.0.6": "8daf828cc77bcf7d63b0e3bdb6caa47e2272dcfaf4fbfe46f8c3a9df087a829b",
        "unicode-display_width-2.5.0": "7e7681dcade1add70cb9fda20dd77f300b8587c81ebbd165d14fd93144ff0ab4",
        "webmock-3.21.0": "6609ab365daa85d203fcc297d1fffdbc8fc4216308b7c77d620af7d1261e2fd2",
        "webrick-1.8.1": "19411ec6912911fd3df13559110127ea2badd0c035f7762873f58afc803e158f",
        "websocket-1.2.10": "2cc1a4a79b6e63637b326b4273e46adcddf7871caa5dc5711f2ca4061a629fa8",
        "yard-0.9.36": "5505736c1b00c926f71053a606ab75f02070c5960d0778b901fe9d8b0a470be4",
    },
    gemfile = "//:rb/Gemfile",
    gemfile_lock = "//:rb/Gemfile.lock",
)

http_archive(
    name = "com_github_bazelbuild_buildtools",
    sha256 = "65391537d1ef528bf772ae25d2c163bd5cee6a929b06cad985e0734f1a12610b",
    strip_prefix = "buildtools-6.1.2",
    urls = [
        "https://github.com/bazelbuild/buildtools/archive/refs/tags/v6.1.2.zip",
    ],
)
