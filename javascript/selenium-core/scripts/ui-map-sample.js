// sample UI element mapping definition. This is for http://alistapart.com/,
// a particularly well structured site on web design principles.



// in general, the map should capture structural aspects of the system, instead
// of "content". In other words, interactive elements / assertible elements
// that can be counted on to always exist should be defined here. Content -
// for example text or a link that appears in a blog entry - is always liable
// to change, and will not be fun to represent in this way. You probably don't
// want to be testing specific content anyway.

// create the UI mapping object. THIS IS THE MOST IMPORTANT PART - DON'T FORGET
// TO DO THIS! In order for it to come into play, a user extension must
// construct the map in this way.
var myMap = new UIMap();




// any values which may appear multiple times can be defined as variables here.
// For example, here we're enumerating a list of top level topics that will be
// used as default argument values for several UI elements. Check out how
// this variable is referenced further down.
var topics = [
    'Code',
    'Content',
    'Culture',
    'Design',
    'Process',
    'User Science'
];

// map subtopics to their parent topics
var subtopics = {
    'Browsers':         'Code'
    , 'CSS':            'Code'
    , 'Flash':          'Code'
    , 'HTML and XHTML': 'Code'
    , 'Scripting':      'Code'
    , 'Server Side':    'Code'
    , 'XML':            'Code'
    , 'Brand Arts': 'Content'
    , 'Community':  'Content'
    , 'Writing':    'Content'
    , 'Industry':           'Culture'
    , 'Politics and Money': 'Culture'
    , 'State of the Web':   'Culture'
    , 'Graphic Design':        'Design'
    , 'User Interface Design': 'Design'
    , 'Typography':            'Design'
    , 'Layout':                'Design'
    , 'Business':                        'Process'
    , 'Creativity':                      'Process'
    , 'Project Management and Workflow': 'Process'
    , 'Accessibility':            'User Science'
    , 'Information Architecture': 'User Science'
    , 'Usability':                'User Science'
};



// define UI elements common for all pages. This regular expression does the
// trick. '^' is automatically prepended, and '$' is automatically postpended.
// Please note that because the regular expression is being represented as a
// string, all backslashes must be escaped with an additional backslash. Also
// note that the URL being matched will always have any trailing forward slash
// stripped.
myMap.addPageset({
    name: 'allPages'
    , description: 'all alistapart.com pages'
    , pathRegexp: '.*'
});
myMap.addElement('allPages', {
    name: 'masthead'
    // the description should be short and to the point, usually no longer than
    // a single line
    , description: 'top level image link to site homepage'
    // make sure the function returns the XPath ... it's easy to leave out the
    // "return" statement by accident!
    , locator: "xpath=//*[@id='masthead']/a/img"
    , testcase1: {
        xhtml: '<h1 id="masthead"><a><img expected-result="1" /></a></h1>'
    }
});
myMap.addElement('allPages', {
    // be VERY CAREFUL to include commas in the correct place. Missing commas
    // and extra commas can cause lots of headaches when debugging map
    // definition files!!!
    name: 'current_issue'
    , description: 'top level link to issue currently being browsed'
    , locator: "//div[@id='ish']/a"
    , testcase1: {
        xhtml: '<div id="ish"><a expected-result="1"></a></div>'
    }
});
myMap.addElement('allPages', {
    name: 'section'
    , description: 'top level link to articles section'
    , args: [
        {
            name: 'section'
            , description: 'the name of the section'
            , defaultValues: [
                'articles'
                , 'topics'
                , 'about'
                , 'contact'
                , 'contribute'
                , 'feed'
            ]
        }
    ]
    // getXPath has been deprecated by getLocator, but verify backward
    // compatability here
    , getXPath: function(args) {
        return "//li[@id=" + args.section.quoteForXPath() + "]/a";
    }
    , testcase1: {
        args: { section: 'feed' }
        , xhtml: '<ul><li id="feed"><a expected-result="1" /></li></ul>'
    }
});
myMap.addElement('allPages', {
    name: 'search_box'
    , description: 'site search input field'
    // xpath has been deprecated by locator, but verify backward compatability
    , xpath: "//input[@id='search']"
    , testcase1: {
        xhtml: '<input id="search" expected-result="1" />'
    }
});
myMap.addElement('allPages', {
    name: 'search_discussions'
    , description: 'site search include discussions checkbox'
    , locator: 'incdisc'
    , testcase1: {
        xhtml: '<input id="incdisc" expected-result="1" />'
    }
});
myMap.addElement('allPages', {
    name: 'search_submit'
    , description: 'site search submission button'
    , locator: 'submit'
    , testcase1: {
        xhtml: '<input id="submit" expected-result="1" />'
    }
});
myMap.addElement('allPages', {
    name: 'topics'
    , description: 'sidebar links to topic categories'
    , args: [
        {
            name: 'topic'
            , description: 'the name of the topic'
            , defaultValues: topics
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='topiclist']/ul/li" +
            "/a[text()=" + args.topic.quoteForXPath() + "]";
    }
    , testcase1: {
        args: { topic: 'foo' }
        , xhtml: '<div id="topiclist"><ul><li>'
            + '<a expected-result="1">foo</a>'
            + '</li></ul></div>'
    }
});
myMap.addElement('allPages', {
    name: 'copyright'
    , description: 'footer link to copyright page'
    , getLocator: function(args) { return "//span[@class='copyright']/a"; }
    , testcase1: {
        xhtml: '<span class="copyright"><a expected-result="1" /></span>'
    }
});



// define UI elements for the homepage, i.e. "http://alistapart.com/", and
// magazine issue pages, i.e. "http://alistapart.com/issues/234".
myMap.addPageset({
    name: 'issuePages'
    , description: 'pages including magazine issues'
    , pathRegexp: '(issues/.+)?'
});
myMap.addElement('issuePages', {
    name: 'article'
    , description: 'front or issue page link to article'
    , args: [
        {
            name: 'index'
            , description: 'the index of the article'
            // an array of default values for the argument. A default
            // value is one that is passed to the getXPath() method of
            // the container UIElement object when trying to build an
            // element locator.
            //
            // range() may be used to count easily. Remember though that
            // the ending value does not include the right extreme; for
            // example range(1, 5) counts from 1 to 4 only.
            , defaultValues: range(1, 5)
        }
    ]
    , getLocator: function(args) {
        return "//div[@class='item'][" + args.index + "]/h4/a";
    }
});
myMap.addElement('issuePages', {
    name: 'author'
    , description: 'article author link'
    , args: [
        {
            name: 'index'
            , description: 'the index of the author, by article'
            , defaultValues: range(1, 5)
        }
    ]
    , getLocator: function(args) {
        return "//div[@class='item'][" + args.index + "]/h5/a";
    }
});
myMap.addElement('issuePages', {
    name: 'store'
    , description: 'alistapart.com store link'
    , locator: "//ul[@id='banners']/li/a[@title='ALA Store']/img"
});
myMap.addElement('issuePages', {
    name: 'special_article'
    , description: "editor's choice article link"
    , locator: "//div[@id='choice']/h4/a"
});
myMap.addElement('issuePages', {
    name: 'special_author'
    , description: "author link of editor's choice article"
    , locator: "//div[@id='choice']/h5/a"
});



// define UI elements for the articles page, i.e.
// "http://alistapart.com/articles"
myMap.addPageset({
    name: 'articleListPages'
    , description: 'page with article listings'
    , paths: [ 'articles' ]
});
myMap.addElement('articleListPages', {
    name: 'issue'
    , description: 'link to issue'
    , args: [
        {
            name: 'index'
            , description: 'the index of the issue on the page'
            , defaultValues: range(1, 10)
        }
    ]
    , getLocator: function(args) {
        return "//h2[@class='ishinfo'][" + args.index + ']/a';
    }
    , genericLocator: "//h2[@class='ishinfo']/a"
});
myMap.addElement('articleListPages', {
    name: 'article'
    , description: 'link to article, by issue and article number'
    ,  args: [
        {
            name: 'issue_index'
            , description: "the index of the article's issue on the page; "
                + 'typically five per page'
            , defaultValues: range(1, 6)
        }
        , {
            name: 'article_index'
            , description: 'the index of the article within the issue; '
                + 'typically two per issue'
            , defaultValues: range(1, 5)
        }
    ]
    , getLocator: function(args) {
        var xpath = "//h2[@class='ishinfo'][" + (args.issue_index || 1) + ']'
            + "/following-sibling::div[@class='item']"
            + '[' + (args.article_index || 1) + "]/h3[@class='title']/a";
        return xpath;
    }
    , genericLocator: "//h2[@class='ishinfo']"
        + "/following-sibling::div[@class='item']/h3[@class='title']/a"
});
myMap.addElement('articleListPages', {
    name: 'author'
    , description: 'article author link, by issue and article'
    , args: [
        {
            name: 'issue_index'
            , description: "the index of the article's issue on the page; \
typically five per page"
            , defaultValues: range(1, 6)
        }
        , {
            name: 'article_index'
            , description: "the index of the article within the issue; \
typically two articles per issue"
            , defaultValues: range(1, 3)
        }
    ]
    // this XPath uses the "following-sibling" axis. The div elements for
    // the articles in an issue are not children, but siblings of the h2
    // element identifying the article.
    , getLocator: function(args) {
        var xpath = "//h2[@class='ishinfo'][" + (args.issue_index || 1) + ']'
            + "/following-sibling::div[@class='item']"
            + '[' + (args.article_index || 1) + "]/h4[@class='byline']/a";
        return xpath;
    }
    , genericLocator: "//h2[@class='ishinfo']"
        + "/following-sibling::div[@class='item']/h4[@class='byline']/a"
});
myMap.addElement('articleListPages', {
    name: 'next_page'
    , description: 'link to next page of articles (older)'
    , locator: "//a[contains(text(),'Next page')]"
});
myMap.addElement('articleListPages', {
    name: 'previous_page'
    , description: 'link to previous page of articles (newer)'
    , locator: "//a[contains(text(),'Previous page')]"
});



// define UI elements for specific article pages, i.e.
// "http://alistapart.com/articles/culturalprobe"
myMap.addPageset({
    name: 'articlePages'
    , description: 'pages for actual articles'
    , pathRegexp: 'articles/.+'
});
myMap.addElement('articlePages', {
    name: 'title'
    , description: 'article title loop-link'
    , locator: "//div[@id='content']/h1[@class='title']/a"
});
myMap.addElement('articlePages', {    
    name: 'author'
    , description: 'article author link'
    , locator: "//div[@id='content']/h3[@class='byline']/a"
});
myMap.addElement('articlePages', {    
    name: 'article_topics'
    , description: 'links to topics under which article is published, before \
article content'
    , args: [
        {
            name: 'topic'
            , description: 'the name of the topic'
            , defaultValues: keys(subtopics)
        }
    ]
    , getLocator: function(args) {
        return "//ul[@id='metastuff']/li/a"
            + "[@title=" + args.topic.quoteForXPath() + "]";
    }
});
myMap.addElement('articlePages', {    
    name: 'discuss'
    , description: 'link to article discussion area, before article content'
    , locator: "//ul[@id='metastuff']/li[@class='discuss']/p/a"
});
myMap.addElement('articlePages', {    
    name: 'related_topics'
    , description: 'links to topics under which article is published, after \
article content'
    , args: [
        {
            name: 'topic'
            , description: 'the name of the topic'
            , defaultValues: keys(subtopics)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='learnmore']/p/a"
            + "[@title=" + args.topic.quoteForXPath() + "]";
    }
});
myMap.addElement('articlePages', {    
    name: 'join_discussion'
    , description: 'link to article discussion area, after article content'
    , locator: "//div[@class='discuss']/p/a"
});



myMap.addPageset({
    name: 'topicListingPages'
    , description: 'top level listing of topics'
    , paths: [ 'topics' ]
});
myMap.addElement('topicListingPages', {
    name: 'topic'
    , description: 'link to topic category'
    , args: [
        {
            name: 'topic'
            , description: 'the name of the topic'
            , defaultValues: topics
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/h2/a"
            + "[text()=" + args.topic.quoteForXPath() + "]";
    }
});
myMap.addElement('topicListingPages', {
    name: 'subtopic'
    , description: 'link to subtopic category'
    , args: [
        {
            name: 'subtopic'
            , description: 'the name of the subtopic'
            , defaultValues: keys(subtopics)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']" +
            "/descendant::a[text()=" + args.subtopic.quoteForXPath() + "]";
    }
});

// the following few subtopic page UI elements are very similar. Define UI
// elements for the code page, which is a subpage under topics, i.e.
// "http://alistapart.com/topics/code/"
myMap.addPageset({
    name: 'subtopicListingPages' 
    , description: 'pages listing subtopics'
    , pathPrefix: 'topics/'
    , paths: [
        'code'
        , 'content'
        , 'culture'
        , 'design'
        , 'process'
        , 'userscience'
    ]
});
myMap.addElement('subtopicListingPages', {
    name: 'subtopic'
    , description: 'link to a subtopic category'
    , args: [
        {
            name: 'subtopic'
            , description: 'the name of the subtopic'
            , defaultValues: keys(subtopics)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/h2" +
            "/a[text()=" + args.subtopic.quoteForXPath() + "]";
    }
});



// subtopic articles page
myMap.addPageset({
    name: 'subtopicArticleListingPages'
    , description: 'pages listing the articles for a given subtopic'
    , pathRegexp: 'topics/[^/]+/.+'
});
myMap.addElement('subtopicArticleListingPages', {
    name: 'article'
    , description: 'link to a subtopic article'
    , args: [
        {
            name: 'index'
            , description: 'the index of the article'
            , defaultValues: range(1, 51) // the range seems unlimited ...
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/div[@class='item']"
            + "[" + args.index + "]/h3/a";
    }
    , testcase1: {
        args: { index: 2 }
        , xhtml: '<div id="content"><div class="item" /><div class="item">'
            + '<h3><a expected-result="1" /></h3></div></div>'
    }
});
myMap.addElement('subtopicArticleListingPages', {
    name: 'author'
    , description: "link to a subtopic article author's page"
    , args: [
        {
            name: 'article_index'
            , description: 'the index of the authored article'
            , defaultValues: range(1, 51)
        }
        , {
            name: 'author_index'
            , description: 'the index of the author when there are multiple'
            , defaultValues: range(1, 4)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/div[@class='item'][" +
            args.article_index + "]/h4/a[" +
            (args.author_index ? args.author_index : '1') + ']';
    }
});
myMap.addElement('subtopicArticleListingPages', {
    name: 'issue'
    , description: 'link to issue a subtopic article appears in'
    , args: [
        {
            name: 'index'
            , description: 'the index of the subtopic article'
            , defaultValues: range(1, 51)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/div[@class='item']"
            + "[" + args.index + "]/h5/a";
    }
});



myMap.addPageset({
    name: 'aboutPages'
    , description: 'the website about page'
    , paths: [ 'about' ]
});
myMap.addElement('aboutPages', {
    name: 'crew'
    , description: 'link to site crew member bio or personal website'
    , args: [
        {
            name: 'role'
            , description: 'the role of the crew member'
            , defaultValues: [
                'ALA Crew'
                , 'Support'
                , 'Emeritus'
            ]
        }
        , {
            name: 'role_index'
            , description: 'the index of the member within the role'
            , defaultValues: range(1, 20)
        }
        , {
            name: 'member_index'
            , description: 'the index of the member within the role title'
            , defaultValues: range(1, 5)
        }
    ]
    , getLocator: function(args) {
        // the first role is kind of funky, and requires a conditional to
        // build the XPath correctly. Its header looks like this:
        //
        // <h3>
        // <span class="caps">ALA 4</span>.0 <span class="caps">CREW</span>
        // </h3>
        //
        // This kind of complexity is a little daunting, but you can see
        // how the format can handle it relatively easily and concisely.
        if (args.role == 'ALA Crew') {
            var selector = "descendant::text()='CREW'";
        }
        else {
            var selector = "text()=" + args.role.quoteForXPath();
        }
        var xpath =
            "//div[@id='secondary']/h3[" + selector + ']' +
            "/following-sibling::dl/dt[" + (args.role_index || 1) + ']' +
            '/a[' + (args.member_index || '1') + ']';
        return xpath;
    }
});



myMap.addPageset({
    name: 'searchResultsPages'
    , description: 'pages listing search results'
    , paths: [ 'search' ]
});
myMap.addElement('searchResultsPages', {
    name: 'result_link'
    , description: 'search result link'
    , args: [
        {
            name: 'index'
            , description: 'the index of the search result'
            , defaultValues: range(1, 11)
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/ul[" + args.index + ']/li/h3/a';
    }
});
myMap.addElement('searchResultsPages', {
    name: 'more_results_link'
    , description: 'next or previous results link at top or bottom of page'
    , args: [
        {
            name: 'direction'
            , description: 'next or previous results page'
            // demonstrate a method which acquires default values from the
            // document object. Such default values may contain EITHER commas
            // OR equals signs, but NOT BOTH.
            , getDefaultValues: function(inDocument) {
                var defaultValues = [];
                var divs = inDocument.getElementsByTagName('div');
                for (var i = 0; i < divs.length; ++i) {
                    if (divs[i].className == 'pages') {
                        break;
                    }
                }
                var links = divs[i].getElementsByTagName('a');
                for (i = 0; i < links.length; ++i) {
                    defaultValues.push(links[i].innerHTML
                        .replace(/^\xab\s*/, "")
                        .replace(/\s*\bb$/, "")
                        .replace(/\s*\d+$/, ""));
                }
                return defaultValues;
            }
        }
        , {
            name: 'position'
            , description: 'position of the link'
            , defaultValues: ['top', 'bottom']
        }
    ]
    , getLocator: function(args) {
        return "//div[@id='content']/div[@class='pages']["
            + (args.position == 'top' ? '1' : '2') + ']'
            + "/a[contains(text(), "
            + (args.direction ? args.direction.quoteForXPath() : undefined)
            + ")]";
    }
});
    
    
    
myMap.addPageset({
    name: 'commentsPages'
    , description: 'pages listing comments made to an article'
    , pathRegexp: 'comments/.+'
});
myMap.addElement('commentsPages', {
    name: 'article_link'
    , description: 'link back to the original article'
    , locator: "//div[@id='content']/h1[@class='title']/a"
});
myMap.addElement('commentsPages', {
    name: 'comment_link'
    , description: 'same-page link to comment'
    , args: [
        {
            name: 'index'
            , description: 'the index of the comment'
            , defaultValues: range(1, 11)
        }
    ]
    , getLocator: function(args) {
        return "//div[@class='content']/div[contains(@class, 'comment')]" +
            '[' + args.index + ']/h4/a[2]';
    }
});
myMap.addElement('commentsPages', {
    name: 'paging_link'
    , description: 'links to more pages of comments'
    , args: [
        {
            name: 'dest'
            , description: 'the destination page'
            , defaultValues: ['next', 'prev'].concat(range(1, 16))
        }
        , {
            name: 'position'
            , description: 'position of the link'
            , defaultValues: ['top', 'bottom']
        }
    ]
    , getLocator: function(args) {
        var dest = args.dest;
        var xpath = "//div[@id='content']/div[@class='pages']" +
            '[' + (args.position == 'top' ? '1' : '2') + ']/p';
        if (dest == 'next' || dest == 'prev') {
            xpath += "/a[contains(text(), " + dest.quoteForXPath() + ")]";
        }
        else {
            xpath += "/a[text()=" + dest.quoteForXPath() + "]";
        }
        return xpath;
    }
});



myMap.addPageset({
    name: 'authorPages'
    , description: 'personal pages for each author'
    , pathRegexp: 'authors/[a-z]/.+'
});
myMap.addElement('authorPages', {
    name: 'article'
    , description: "link to article written by this author.\n"
        + 'This description has a line break.'
    , args: [
        {
            name: 'index'
            , description: 'index of the article on the page'
            , defaultValues: range(1, 11)
        }
    ]
    , getLocator: function(args) {
        var index = args.index;
        // try out the CSS locator!
        //return "//h4[@class='title'][" + index + "]/a";
        return 'css=h4.title:nth-child(' + index + ') > a';
    }
    , testcase1: {
        args: { index: '2' }
        , xhtml: '<h4 class="title" /><h4 class="title">'
            + '<a expected-result="1" /></h4>'
    }
});



// test the offset locator. Something like the following can be recorded:
// ui=qaPages::content()//a[contains(text(),'May I quote from your articles?')]
myMap.addPageset({
    name: 'qaPages'
    , description: 'question and answer pages'
    , pathRegexp: 'qa'
});
myMap.addElement('qaPages', {
    name: 'content'
    , description: 'the content pane containing the q&a entries'
    , locator: "//div[@id='content' and "
        + "child::h1[text()='Questions and Answers']]"
    , getOffsetLocator: UIElement.defaultOffsetLocatorStrategy
});
myMap.addElement('qaPages', {
    name: 'last_updated'
    , description: 'displays the last update date'
    // demonstrate calling getLocator() for another UI element within a
    // getLocator(). The former must have already been added to the map. And
    // obviously, you can't randomly combine different locator types!
    , locator: myMap.getUIElement('qaPages', 'content').getLocator() + '/p/em'
});



//******************************************************************************

var myRollupManager = new RollupManager();

// though the description element is required, its content is free form. You
// might want to create a documentation policy as given below, where the pre-
// and post-conditions of the rollup are spelled out.
//
// To take advantage of a "heredoc" like syntax for longer descriptions,
// add a backslash to the end of the current line and continue the string on
// the next line.
myRollupManager.addRollupRule({
    name: 'navigate_to_subtopic_article_listing'
    , description: 'drill down to the listing of articles for a given subtopic \
from the section menu, then the topic itself.'
    , pre: 'current page contains the section menu (most pages should)'
    , post: 'navigated to the page listing all articles for a given subtopic'
    , args: [
        {
            name: 'subtopic'
            , description: 'the subtopic whose article listing to navigate to'
            , exampleValues: keys(subtopics)
        }
    ]
    , commandMatchers: [
        {
            command: 'clickAndWait'
            , target: 'ui=allPages::section\\(section=topics\\)'
            // must escape parentheses in the the above target, since the
            // string is being used as a regular expression. Again, backslashes
            // in strings must be escaped too.
        }
        , {
            command: 'clickAndWait'
            , target: 'ui=topicListingPages::topic\\(.+'
        }
        , {
            command: 'clickAndWait'
            , target: 'ui=subtopicListingPages::subtopic\\(.+'
            , updateArgs: function(command, args) {
                // don't bother stripping the "ui=" prefix from the locator
                // here; we're just using UISpecifier to parse the args out
                var uiSpecifier = new UISpecifier(command.target);
                args.subtopic = uiSpecifier.args.subtopic;
                return args;
            }
        }
    ]
    , getExpandedCommands: function(args) {
        var commands = [];
        var topic = subtopics[args.subtopic];
        var subtopic = args.subtopic;
        commands.push({
            command: 'clickAndWait'
            , target: 'ui=allPages::section(section=topics)'
        });
        commands.push({
            command: 'clickAndWait'
            , target: 'ui=topicListingPages::topic(topic=' + topic + ')'
        });
        commands.push({
            command: 'clickAndWait'
            , target: 'ui=subtopicListingPages::subtopic(subtopic=' + subtopic
                + ')'
        });
        commands.push({
            command: 'verifyLocation'
            , target: 'regexp:.+/topics/.+/.+'
        });
        return commands;
    }
});



myRollupManager.addRollupRule({
    name: 'replace_click_with_clickAndWait'
    , description: 'replaces commands where a click was detected with \
clickAndWait instead'
    , alternateCommand: 'clickAndWait'
    , commandMatchers: [
        {
            command: 'click'
            , target: 'ui=subtopicArticleListingPages::article\\(.+'
        }
    ]
    , expandedCommands: []
});



myRollupManager.addRollupRule({
    name: 'navigate_to_subtopic_article'
    , description: 'navigate to an article listed under a subtopic.'
    , pre: 'current page contains the section menu (most pages should)'
    , post: 'navigated to an article page'
    , args: [
        {
            name: 'subtopic'
            , description: 'the subtopic whose article listing to navigate to'
            , exampleValues: keys(subtopics)
        }
        , {
            name: 'index'
            , description: 'the index of the article in the listing'
            , exampleValues: range(1, 11)
        }
    ]
    , commandMatchers: [
        {
            command: 'rollup'
            , target: 'navigate_to_subtopic_article_listing'
            , value: 'subtopic\\s*=.+'
            , updateArgs: function(command, args) {
                var args1 = parse_kwargs(command.value);
                args.subtopic = args1.subtopic;
                return args;
            }
        }
        , {
            command: 'clickAndWait'
            , target: 'ui=subtopicArticleListingPages::article\\(.+'
            , updateArgs: function(command, args) {
                var uiSpecifier = new UISpecifier(command.target);
                args.index = uiSpecifier.args.index;
                return args;
            }
        }
    ]
    /*
    // this is pretty much equivalent to the commandMatchers immediately above.
    // Seems more verbose and less expressive, doesn't it? But sometimes you
    // might prefer the flexibility of a function.
    , getRollup: function(commands) {
        if (commands.length >= 2) {
            command1 = commands[0];
            command2 = commands[1];
            var args1 = parse_kwargs(command1.value);
            try {
                var uiSpecifier = new UISpecifier(command2.target
                    .replace(/^ui=/, ''));
            }
            catch (e) {
                return false;
            }
            if (command1.command == 'rollup' &&
                command1.target == 'navigate_to_subtopic_article_listing' &&
                args1.subtopic &&
                command2.command == 'clickAndWait' &&
                uiSpecifier.pagesetName == 'subtopicArticleListingPages' &&
                uiSpecifier.elementName == 'article') {
                var args = {
                    subtopic: args1.subtopic
                    , index: uiSpecifier.args.index
                };
                return {
                    command: 'rollup'
                    , target: this.name
                    , value: to_kwargs(args)
                    , replacementIndexes: [ 0, 1 ]
                };
            }
        }
        return false;
    }
    */
    , getExpandedCommands: function(args) {
        var commands = [];
        commands.push({
            command: 'rollup'
            , target: 'navigate_to_subtopic_article_listing'
            , value: to_kwargs({ subtopic: args.subtopic })
        });
        var uiSpecifier = new UISpecifier(
            'subtopicArticleListingPages'
            , 'article'
            , { index: args.index });
        commands.push({
            command: 'clickAndWait'
            , target: 'ui=' + uiSpecifier.toString()
        });
        commands.push({
            command: 'verifyLocation'
            , target: 'regexp:.+/articles/.+'
        });
        return commands;
    }
});
































