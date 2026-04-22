"""Module extension to download CDDL spec files from w3c/webref at a pinned commit."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

# Pinned to https://github.com/w3c/webref/tree/5301ec52f85f9156ae696f24523d722193fc0817/ed/cddl
_BASE_URL = "https://raw.githubusercontent.com/w3c/webref/5301ec52f85f9156ae696f24523d722193fc0817/ed/cddl"

def webref_cddl():
    http_file(
        name = "at_driver_all_cddl",
        sha256 = "f8502ca866e494d9c46a5209eb0cfec57107fffe587d154a365a19e8b93dd7aa",
        url = _BASE_URL + "/at-driver-all.cddl",
    )

    http_file(
        name = "at_driver_local_cddl",
        sha256 = "f1b64b2d852c5ea826cc9a6431196979cdf7c73a0182c98dc7c3c40005bdbcba",
        url = _BASE_URL + "/at-driver-local-cddl.cddl",
    )

    http_file(
        name = "at_driver_remote_cddl",
        sha256 = "18ec6dc05d515b6f01169db3aa27f36c38f3ecb0c7c070735d27c7f1b1957533",
        url = _BASE_URL + "/at-driver-remote-cddl.cddl",
    )

    http_file(
        name = "permissions_all_cddl",
        sha256 = "50e9b0017415e27a18a190bf37df048d4513f8432e42fe97901c9f2d55204b50",
        url = _BASE_URL + "/permissions-all.cddl",
    )

    http_file(
        name = "permissions_local_cddl",
        sha256 = "0f9f266f9e991eb7656848e917318b5aae4b06b4cf3b48e95ee50ed264912cb8",
        url = _BASE_URL + "/permissions-local-cddl.cddl",
    )

    http_file(
        name = "permissions_remote_cddl",
        sha256 = "17b968bbaf97782908c69637cc1152d0119c559f5f50b047e5e30894bf798983",
        url = _BASE_URL + "/permissions-remote-cddl.cddl",
    )

    http_file(
        name = "prefetch_all_cddl",
        sha256 = "51409b998176a81f681252f8ee16bea5a54a3be9d1cfee9f13ca34efd1feb5ea",
        url = _BASE_URL + "/prefetch-all.cddl",
    )

    http_file(
        name = "prefetch_local_cddl",
        sha256 = "51409b998176a81f681252f8ee16bea5a54a3be9d1cfee9f13ca34efd1feb5ea",
        url = _BASE_URL + "/prefetch-local-cddl.cddl",
    )

    http_file(
        name = "ua_client_hints_all_cddl",
        sha256 = "6bb41f05d09c755305226b7350970e54f6404698510ea2e1e7a931eaa2647aeb",
        url = _BASE_URL + "/ua-client-hints-all.cddl",
    )

    http_file(
        name = "ua_client_hints_local_cddl",
        sha256 = "c71077e4ecea5f1cbed309cfb16418195ffdb631621eff3f9c784907c9c2c7dc",
        url = _BASE_URL + "/ua-client-hints-local-cddl.cddl",
    )

    http_file(
        name = "ua_client_hints_remote_cddl",
        sha256 = "c62185206132fbea3085e87af93315a7ecc39c802c20a2aa5d808d668e5664f7",
        url = _BASE_URL + "/ua-client-hints-remote-cddl.cddl",
    )

    http_file(
        name = "web_bluetooth_all_cddl",
        sha256 = "bc687d19c1e92cf4f0a37bbf7f9aa21db956344b34d8cdda4319b7f4615b6d1d",
        url = _BASE_URL + "/web-bluetooth-all.cddl",
    )

    http_file(
        name = "web_bluetooth_local_cddl",
        sha256 = "bc687d19c1e92cf4f0a37bbf7f9aa21db956344b34d8cdda4319b7f4615b6d1d",
        url = _BASE_URL + "/web-bluetooth-local-cddl.cddl",
    )

    http_file(
        name = "web_bluetooth_remote_cddl",
        sha256 = "25bef59834f25d7113e123898b952f6d37b78836b05c1a3b58012879ccebe176",
        url = _BASE_URL + "/web-bluetooth-remote-cddl.cddl",
    )

    http_file(
        name = "webdriver_bidi_all_cddl",
        sha256 = "58baffeda459e2fee2d9b58a896eb4394e87e861ada5cb761a169d32e122138f",
        url = _BASE_URL + "/webdriver-bidi-all.cddl",
    )

    http_file(
        name = "webdriver_bidi_local_cddl",
        sha256 = "a88eec3567ed06b3a3884f9b4ef334c1726a64050e4290ae66c417ef1c77ea06",
        url = _BASE_URL + "/webdriver-bidi-local-cddl.cddl",
    )

    http_file(
        name = "webdriver_bidi_remote_cddl",
        sha256 = "e51f3f0103664842b3c1211d4c6726b014658945d6166155054617904f40cbe0",
        url = _BASE_URL + "/webdriver-bidi-remote-cddl.cddl",
    )

def _webref_cddl_impl(_ctx):
    webref_cddl()

webref_cddl_extension = module_extension(
    implementation = _webref_cddl_impl,
)
