chrome_data = select({
   "//common:use_chromedriver": ["//common:chromedriver"],
   "//conditions:default": []
})

chrome_jvm_flags = select({
  "//common:use_chromedriver": [
      "-Dwebdriver.chrome.driver=$(location //common:chromedriver)",
  ],
  "//conditions:default": [
      "-Dselenium.skiptest=true",
  ]
})

firefox_data = ["//common:geckodriver"]

firefox_jvm_flags = select({
    "//common:use_pinned_firefox": [
        "-Dwebdriver.gecko.driver=$(location //common:geckodriver)",
        "-Dwebdriver.firefox.bin=$(location ",
    ],
    "//common:use_local_geckodriver": [
        "-Dwebdriver.gecko.driver=$(location //common:geckodriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
})

edge_data = select({
   "//common:use_msedgedriver": ["//common:msedgedriver"],
   "//conditions:default": []
})

edge_jvm_flags = select({
  "//common:use_msedgedriver": [
      "-Dwebdriver.edge.driver=$(location //common:msedgedriver)",
  ],
  "//conditions:default": [
      "-Dselenium.skiptest=true",
  ],
})
