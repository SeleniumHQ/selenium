function add_version_dropdown(json_loc, target_loc, text) {

    var dropdown = document.createElement("div");
    dropdown.className = "md-flex__cell md-flex__cell--shrink dropdown";
    var button = document.createElement("button");
    button.className = "dropdownbutton";
    var content = document.createElement("div");
    content.className = "dropdown-content md-hero";
    dropdown.appendChild(button);
    dropdown.appendChild(content);
    $.getJSON(json_loc, function(versions) {
        for (var key in versions) {
            if (versions.hasOwnProperty(key)) {
                console.log(key, versions[key]);
                var a = document.createElement("a");
                a.innerHTML = key;
                a.title = key;
                a.href = target_loc + versions[key];
                content.appendChild(a);
            }
        }
    }).done(function() {
        button.innerHTML = text;
    }).fail(function() {
        button.innerHTML = "Other Versions Not Found";
    }).always(function() {
        $(".navheader").append(dropdown);
    });
};
