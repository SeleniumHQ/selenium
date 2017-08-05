closure_library(
  name = 'watir',
  srcs = ['watir.js'],
  deps = [
    '//third_party/closure:closure',
  ],
)

closure_fragment(
  name = 'fireEvent',
  module = 'bot.events',
  function = 'bot.events.fire',
  deps = [
   '//javascript/atoms:events',
  ],
)
  
closure_fragment(
  name = 'getParentElement',
  module = 'bot.dom',
  function = 'bot.dom.getParentElement',
  deps = [
   '//javascript/atoms:dom',
  ],
)

closure_fragment(
  name = 'getOuterHtml',
  module = 'goog.dom',
  function = 'goog.dom.getOuterHtml',
  deps = [
    '//third_party/closure:closure'
  ],
)

closure_fragment(
  name = 'selectText',
  module = 'watir',
  function = 'watir.selectText',
  deps = [
    ':watir'
  ],
)
  
closure_fragment(
  name = 'getAttribute',
  module = 'bot.dom',
  function = 'bot.dom.getAttribute',
  deps = [
    '//javascript/atoms:dom'
  ],
)
