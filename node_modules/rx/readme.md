[![Build Status](https://travis-ci.org/Reactive-Extensions/RxJS.svg)](https://travis-ci.org/Reactive-Extensions/RxJS)
[![GitHub version](https://img.shields.io/github/tag/reactive-extensions/rxjs.svg)](https://github.com/Reactive-Extensions/RxJS)
[![NPM version](https://img.shields.io/npm/v/rx.svg)](https://www.npmjs.com/package/rx)
[![Downloads](https://img.shields.io/npm/dm/rx.svg)](https://www.npmjs.com/package/rx)
[![Bower](https://img.shields.io/bower/v/rxjs.svg)](http://bower.io/search/?q=rxjs)
[![NuGet](https://img.shields.io/nuget/v/RxJS-All.svg)](http://www.nuget.org/packages/RxJS-All/)
[![Join the chat at https://gitter.im/Reactive-Extensions/RxJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Reactive-Extensions/RxJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**[The Need to go Reactive](#the-need-to-go-reactive)** |
**[About the Reactive Extensions](#about-the-reactive-extensions)** |
**[Batteries Included](#batteries-included)** |
**[Why RxJS?](#why-rxjs)** |
**[Dive In!](#dive-in)** |
**[Resources](#resources)** |
**[Getting Started](#getting-started)** |
**[What about my libraries?](#what-about-my-libraries)** |
**[Compatibility](#compatibility)** |
**[Contributing](#contributing)** |
**[License](#license)**

# The Reactive Extensions for JavaScript (RxJS) <sup>4.0</sup>... #

*...is a set of libraries to compose asynchronous and event-based programs using observable collections and [Array#extras](http://blogs.msdn.com/b/ie/archive/2010/12/13/ecmascript-5-part-2-array-extras.aspx) style composition in JavaScript*

The project is actively developed by [Microsoft](https://microsoft.com/), in collaboration with a community of open source developers.

## The Need to go Reactive ##

Applications, especially on the web have changed over the years from being a simple static page, to DHTML with animations, to the Ajax revolution.  Each time, we're adding more complexity, more data, and asynchronous behavior to our applications.  How do we manage it all?  How do we scale it?  By moving towards "Reactive Architectures" which are event-driven, resilient and responsive.  With the Reactive Extensions, you have all the tools you need to help build these systems.

## About the Reactive Extensions ##

The Reactive Extensions for JavaScript (RxJS) is a set of libraries for composing asynchronous and event-based programs using observable sequences and fluent query operators that many of you already know by [Array#extras](http://blogs.msdn.com/b/ie/archive/2010/12/13/ecmascript-5-part-2-array-extras.aspx) in JavaScript. Using RxJS, developers represent asynchronous data streams with Observables, query asynchronous data streams using our many operators, and parameterize the concurrency in the asynchronous data streams using Schedulers. Simply put, RxJS = Observables + Operators + Schedulers.

Whether you are authoring a web-based application in JavaScript or a server-side application in Node.js, you have to deal with asynchronous and event-based programming. Although some patterns are emerging such as the Promise pattern, handling exceptions, cancellation, and synchronization is difficult and error-prone.

Using RxJS, you can represent multiple asynchronous data streams (that come from diverse sources, e.g., stock quote, tweets, computer events, web service requests, etc.), and subscribe to the event stream using the Observer object. The Observable notifies the subscribed Observer instance whenever an event occurs.

Because observable sequences are data streams, you can query them using standard query operators implemented by the Observable type. Thus you can filter, project, aggregate, compose and perform time-based operations on multiple events easily by using these operators. In addition, there are a number of other reactive stream specific operators that allow powerful queries to be written. Cancellation, exceptions, and synchronization are also handled gracefully by using the methods on the Observable object.

But the best news of all is that you already know how to program like this.  Take for example the following JavaScript code, where we get some stock data and then manipulate and iterate the results.

```js
/* Get stock data somehow */
const source = getAsyncStockData();

const subscription = source
  .filter(quote => quote.price > 30)
  .map(quote => quote.price)
  .forEach(price => console.log(`Prices higher than $30: ${price}`);
```

Now what if this data were to come as some sort of event, for example a stream, such as a WebSocket? Then we could pretty much write the same query to iterate our data, with very little change.

```js
/* Get stock data somehow */
const source = getAsyncStockData();

const subscription = source
  .filter(quote => quote.price > 30)
  .map(quote => quote.price)
  .subscribe(
    price => console.log(`Prices higher than $30: ${price}`),
    err => console.log(`Something went wrong: ${err.message}`);
  );

/* When we're done */
subscription.dispose();
```

The only difference is that we can handle the errors inline with our subscription.  And when we're no longer interested in receiving the data as it comes streaming in, we call `dispose` on our subscription.  Note the use of `subscribe` instead of `forEach`.  We could also use `forEach` which is an alias for `subscribe` but we highly suggest you use `subscribe`.

## Batteries Included ##

Sure, there are a lot of libraries to get started with RxJS. Confused on where to get started?  Start out with the complete set of operators with [`rx.all.js`](doc/libraries/main/rx.complete.md), then you can reduce it to the number of operators that you really need, and perhaps stick with something as small as [`rx.lite.js`](doc/libraries/lite/rx.lite.md).  If you're an implementor of RxJS, then you can start out with [`rx.core.js`](doc/libraries/core/rx.core.md).

This set of libraries include:

### The complete library:
- [`rx.all.js`](doc/libraries/main/rx.complete.md)

### Main Libraries:
- [`rx.js`](doc/libraries/main/rx.md)
- [`rx.aggregates.js`](doc/libraries/main/rx.aggregates.md)
- [`rx.async.js`](doc/libraries/main/rx.async.md)
- [`rx.binding.js`](doc/libraries/main/rx.binding.md)
- [`rx.coincidence.js`](doc/libraries/main/rx.coincidence.md)
- [`rx.experimental.js`](doc/libraries/main/rx.experimental.md)
- [`rx.joinpatterns.js`](doc/libraries/main/rx.joinpatterns.md)
- [`rx.testing.js`](doc/libraries/main/rx.testing.md)
- [`rx.time.js`](doc/libraries/main/rx.time.md)
- [`rx.virtualtime.js`](doc/libraries/main/rx.virtualtime.md)

### Lite Libraries:
- [`rx.lite.js`](doc/libraries/lite/rx.lite.md)
- [`rx.lite.extras.js`](doc/libraries/lite/rx.lite.extras.md)
- [`rx.lite.aggregates.js`](doc/libraries/lite/rx.lite.aggregates.md)
- [`rx.lite.async.js`](doc/libraries/lite/rx.lite.async.md)
- [`rx.lite.coincidence.js`](doc/libraries/lite/rx.lite.coincidence.md)
- [`rx.lite.experimental.js`](doc/libraries/lite/rx.lite.experimental.md)
- [`rx.lite.joinpatterns.js`](doc/libraries/lite/rx.lite.joinpatterns.md)
- [`rx.lite.testing.js`](doc/libraries/lite/rx.lite.testing.md)
- [`rx.lite.time.js`](doc/libraries/lite/rx.lite.time.md)
- [`rx.lite.virtualtime.js`](doc/libraries/lite/rx.lite.virtualtime.md)

### Core Libraries:
- [`rx.core.js`](doc/libraries/core/rx.core.md)
- [`rx.core.binding.js`](doc/libraries/core/rx.core.binding.md)
- [`rx.core.testing.js`](doc/libraries/core/rx.core.testing.md)

## Why RxJS? ##

One question you may ask yourself is why RxJS?  What about Promises?  Promises are good for solving asynchronous operations such as querying a service with an XMLHttpRequest, where the expected behavior is one value and then completion.  Reactive Extensions for JavaScript unify both the world of Promises, callbacks as well as evented data such as DOM Input, Web Workers, and Web Sockets. Unifying these concepts enables rich composition.

To give you an idea about rich composition, we can create an autocompletion service which takes user input from a text input and then throttles queries a service (to avoid flooding the service with calls for every key stroke).

First, we'll reference the JavaScript files, including jQuery, although RxJS has no dependencies on jQuery...
```html
<script src="https://code.jquery.com/jquery.js"></script>
<script src="rx.lite.js"></script>
```
Next, we'll get the user input from an input, listening to the keyup event by using the `Rx.Observable.fromEvent` method.  This will either use the event binding from [jQuery](http://jquery.com), [Zepto](http://zeptojs.com/), [AngularJS](https://angularjs.org/), [Backbone.js](http://backbonejs.org/) and [Ember.js](http://emberjs.com/) if available, and if not, falls back to the native event binding.  This gives you consistent ways of thinking of events depending on your framework, so there are no surprises.

```js
const $input = $('#input');
const $results = $('#results');

/* Only get the value from each key up */
var keyups = Rx.Observable.fromEvent($input, 'keyup')
  .pluck('target', 'value')
  .filter(text => text.length > 2 );

/* Now debounce the input for 500ms */
var debounced = keyups
  .debounce(500 /* ms */);

/* Now get only distinct values, so we eliminate the arrows and other control characters */
var distinct = debounced
  .distinctUntilChanged();
```

Now, let's query Wikipedia!  In RxJS, we can instantly bind to any [Promises A+](https://github.com/promises-aplus/promises-spec) implementation through the `Rx.Observable.fromPromise` method. Or, directly return it and RxJS will wrap it for you.

```js
function searchWikipedia (term) {
  return $.ajax({
    url: 'https://en.wikipedia.org/w/api.php',
    dataType: 'jsonp',
    data: {
      action: 'opensearch',
      format: 'json',
      search: term
    }
  }).promise();
}
```

Once that is created, we can tie together the distinct throttled input and query the service.  In this case, we'll call `flatMapLatest` to get the value and ensure we're not introducing any out of order sequence calls.

```js
var suggestions = distinct
  .flatMapLatest(searchWikipedia);
```

Finally, we call the `subscribe` method on our observable sequence to start pulling data.

```js
suggestions.subscribe(
  data => {
    $results
      .empty()
      .append($.map(data[1], value =>  $('<li>').text(value)))
  },
  error=> {
    $results
      .empty()
      .append($('<li>'))
        .text('Error:' + error);
  });
```

And there you have it!

## Dive In! ##

Please check out:

 - [Our Code of Conduct](https://github.com/Reactive-Extensions/RxJS/tree/master/code-of-conduct.md)
 - [The full documentation](https://github.com/Reactive-Extensions/RxJS/tree/master/doc)
 - [Our many great examples](https://github.com/Reactive-Extensions/RxJS/tree/master/examples)
 - [Our design guidelines](https://github.com/Reactive-Extensions/RxJS/tree/master/doc/designguidelines)
 - [Our contribution guidelines](https://github.com/Reactive-Extensions/RxJS/tree/master/contributing.md)
 - [Our complete Unit Tests](https://github.com/Reactive-Extensions/RxJS/tree/master/tests)
 - [Our recipes](https://github.com/Reactive-Extensions/RxJS/wiki/Recipes)

## Resources

- Contact us
    - [Twitter @ReactiveX](https://twitter.com/ReactiveX)
    - [Gitter.im](https://gitter.im/Reactive-Extensions/RxJS)
    - [StackOverflow rxjs](http://stackoverflow.com/questions/tagged/rxjs)

- Tutorials
    - [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
    - [2 minute introduction to Rx](https://medium.com/@andrestaltz/2-minute-introduction-to-rx-24c8ca793877)
    - [Learn RxJS - @jhusain](https://github.com/jhusain/learnrx)
    - [RxJS Koans](https://github.com/Reactive-Extensions/RxJSKoans)
    - [RxJS Workshop from BuildStuff 2014](https://github.com/Reactive-Extensions/BuildStuffWorkshop)
    - [Rx Workshop](http://rxworkshop.codeplex.com/)
    - [Reactive Programming and MVC](http://aaronstacy.com/writings/reactive-programming-and-mvc/)
    - [RxJS lessons - egghead.io](https://egghead.io/technologies/rx)
    - [RxJS Training - @andrestaltz](https://github.com/staltz/rxjs-training)

- Reference Material
    - [Rx Marbles](http://rxmarbles.com/)
    - [RxJS GitBook](http://xgrommx.github.io/rx-book//)
    - [Intro to Rx](http://introtorx.com/)
    - [101 Rx Samples Wiki](http://rxwiki.wikidot.com/101samples)
    - [RxJS Design Guidelines](https://github.com/Reactive-Extensions/RxJS/tree/master/doc/designguidelines)
    - [Visualizing Reactive Streams](http://jaredforsyth.com/2015/03/06/visualizing-reactive-streams-hot-and-cold/)
    - [Your Mouse is a Database](http://queue.acm.org/detail.cfm?id=2169076)

- Essential tools
    - [RxVision](http://jaredforsyth.com/rxvision/)
    - [Percussion](https://github.com/grisendo/Percussion)

- Books
    - [RxJS](http://xgrommx.github.io/rx-book/)
    - [Intro to Rx](http://www.amazon.com/Introduction-to-Rx-ebook/dp/B008GM3YPM/)
    - [Programming Reactive Extensions and LINQ](http://www.amazon.com/Programming-Reactive-Extensions-Jesse-Liberty/dp/1430237473/)
    - [Reactive Programming with RxJS](https://pragprog.com/book/smreactjs/reactive-programming-with-rxjs)

- [Community Examples](examples/community.md)
- [Presentations](examples/presentations.md)
- [Videos and Podcasts](examples/videos.md)

## Getting Started

There are a number of ways to get started with RxJS. The files are available on [cdnjs](http://cdnjs.com/libraries/rxjs/) and [jsDelivr](http://www.jsdelivr.com/#!rxjs).

### Download the Source

```bash
git clone https://github.com/Reactive-Extensions/rxjs.git
cd ./rxjs
```

### Installing with [NPM](https://www.npmjs.com/)

```bash`
$ npm install rx
$ npm install -g rx
```

### Using with Node.js and Ringo.js

```js
var Rx = require('rx');
```

### Installing with [Bower](http://bower.io/)

```bash
$ bower install rxjs
```

### Installing with [Jam](http://jamjs.org/)
```bash
$ jam install rx
```
### Installing All of RxJS via [NuGet](http://www.nuget.org/)
```bash
$ Install-Package RxJS-All
```
### Install individual packages via [NuGet](http://www.nuget.org/):

    Install-Package RxJS-All
    Install-Package RxJS-Lite
    Install-Package RxJS-Main
    Install-Package RxJS-Aggregates
    Install-Package RxJS-Async
    Install-Package RxJS-BackPressure
    Install-Package RxJS-Binding
    Install-Package RxJS-Coincidence
    Install-Package RxJS-Experimental
    Install-Package RxJS-JoinPatterns
    Install-Package RxJS-Testing
    Install-Package RxJS-Time

### In a Browser:

```html
<!-- Just the core RxJS -->
<script src="rx.js"></script>

<!-- Or all of RxJS minus testing -->
<script src="rx.all.js"></script>

<!-- Or keeping it lite -->
<script src="rx.lite.js"></script>
```

### Along with a number of our extras for RxJS:

```html
<script src="rx.aggregates.js"></script>
<script src="rx.async.js"></script>
<script src="rx.backpressure.js"></script>
<script src="rx.binding.js"></script>
<script src="rx.coincidencejs"></script>
<script src="rx.experimental.js"></script>
<script src="rx.joinpatterns.js"></script>
<script src="rx.time.js"></script>
<script src="rx.virtualtime.js"></script>
<script src="rx.testing.js"></script>
```

### Using RxJS with an AMD loader such as Require.js

```js
require({
  'paths': {
    'rx': 'path/to/rx-lite.js'
  }
},
['rx'], (Rx) => {
  const obs = Rx.Observable.of(42);
  obs.forEach(x => console.log(x));
});
```

## What about my libraries? ##

The Reactive Extensions for JavaScript have no external dependencies on any library, so they'll work well with just about any library.  We provide bridges and support for various libraries including:
- [Node.js](https://www.npmjs.com/package/rx-node)
- [React](http://facebook.github.io/react/)
    - [Rx-React](https://github.com/fdecampredon/rx-react)
    - [RxReact](https://github.com/AlexMost/RxReact)
    - [cycle-react](https://github.com/pH200/cycle-react)
- [Flux](http://facebook.github.io/flux/)
    - [Rx-Flux](https://github.com/fdecampredon/rx-flux)
    - [ReactiveFlux](https://github.com/codesuki/reactive-flux)
    - [Thundercats.js](https://github.com/ThunderCatsJS/thundercats)
    - [Flurx](https://github.com/qwtel/flurx)
    - [RR](https://github.com/winsonwq/RR)
- [Ember](http://emberjs.com/)
    - [RxEmber](https://github.com/blesh/RxEmber)
- [AngularJS](https://github.com/Reactive-Extensions/rx.angular.js)
- [HTML DOM](https://github.com/Reactive-Extensions/RxJS-DOM)
- [jQuery (1.4+)](https://github.com/Reactive-Extensions/RxJS-jQuery)
- [MooTools](https://github.com/Reactive-Extensions/RxJS-MooTools)
- [Dojo 1.7+](https://github.com/Reactive-Extensions/RxJS-Dojo)
- [ExtJS](https://github.com/Reactive-Extensions/RxJS-ExtJS)

## Compatibility ##

RxJS has been thoroughly tested against all major browsers and supports IE6+, Chrome 4+, FireFox 1+, and Node.js v0.4+.

## Contributing ##

There are lots of ways to contribute to the project, and we appreciate our [contributors](https://github.com/Reactive-Extensions/RxJS/wiki/Contributors).  If you wish to contribute, check out our [style guide]((https://github.com/Reactive-Extensions/RxJS/tree/master/doc/contributing)).

You can contribute by reviewing and sending feedback on code checkins, suggesting and trying out new features as they are implemented, submit bugs and help us verify fixes as they are checked in, as well as submit code fixes or code contributions of your own. Note that all code submissions will be rigorously reviewed and tested by the Rx Team, and only those that meet an extremely high bar for both quality and design/roadmap appropriateness will be merged into the source.

First-time contributors must sign a [Contribution License Agreement](https://cla.microsoft.com/).  If your Pull Request has the label [cla-required](https://github.com/Reactive-Extensions/RxJS/labels/cla-required), this is an indication that you haven't yet signed such an agreement.

## License ##

Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
Microsoft Open Technologies would like to thank its contributors, a list
of whom are at https://github.com/Reactive-Extensions/RxJS/wiki/Contributors.

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions
and limitations under the License.
