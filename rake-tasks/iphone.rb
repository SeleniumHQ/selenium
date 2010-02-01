def iphone_test(args)
  if iPhoneSDK? then
    system_properties = args[:system_properties]
    if !system_properties then
      system_properties = []
      args[:system_properties] = system_properties
    end
    system_properties.push("webdriver.iphone.sdk=#{iPhoneSDKVersion?}")
    java_test(args)
  else
    task args[:name]
  end
end
