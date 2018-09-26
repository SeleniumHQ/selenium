prebuilt_jar(
  name = 'httpclient',
  maven_coords = 'org.apache.httpcomponents:httpclient:jar:4.5.5',
  binary_jar = 'httpclient-4.5.5.jar',
  source_jar = 'httpclient-4.5.5-sources.jar',
  deps = [
    ':httpcore',
    '//third_party/java/commons-codec:commons-codec',
    '//third_party/java/commons-logging:commons-logging'
  ],
)

prebuilt_jar(
  name = 'httpcore',
  maven_coords = 'org.apache.httpcomponents:httpcore:jar:4.4.9',
  binary_jar = 'httpcore-4.4.9.jar',
  source_jar = 'httpcore-4.4.9-sources.jar',
)

prebuilt_jar(
  name = 'httpmime',
  maven_coords = 'org.apache.httpcomponents:httpmime:jar:4.5.5',
  binary_jar = 'httpmime-4.5.5.jar',
  source_jar = 'httpmime-4.5.5-sources.jar',
  deps = [
    ':httpclient'
  ],
  visibility = [
    '//third_party/java/htmlunit:htmlunit'
  ],
)
