def android_rjava()  
  puts "Generate R.java at: #{$avdname}"
  mkdir_p $java_r, :verbose => false
  cmd = "#{$aapt} package -f -M #{$manifest} -S #{$resource} -I #{$androidjar} -J #{$java_r}"
  sh cmd, :verbose => false
end

def clean_android_env()
  sh "#{$android} delete avd -n #{$avdname}"
end
