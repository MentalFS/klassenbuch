var client;
var main_channel;
var checked  = {};

function main() {
    init_ui();

    //noinspection JSPotentiallyInvalidConstructorUsage
    client = new tmi.client({connection: {reconnect: true}});
    //noinspection JSUnresolvedFunction
    client.connect();
    client.addListener("message", message);
    client.addListener("ban", ban);
    client.addListener("part", part);
    client.addListener("join", join);

    $("#dialog-config").dialog("open");
}

function message(channel, user, message, self) {
    console.log({"type": "message", "channel": channel, "user": user, "message": message, "self": self});
    if (main_channel != channel) return;
    var username = user["username"];
    var displayname = user["display-name"] == null ? username : user["display-name"];
    var mainTable = $("#table-main");

    if (!(username in checked)) {
        mainTable.append($(
            "<div id='main-" + username + "'>" +
            "  <label><input type='checkbox' name='" + username + "'> " + displayname + "</label>" +
            "</div>"));
        $("#main-" + username + " :checkbox").change(function() {
            $("#main-" + username).remove();
            $("#table-checked").append($("<div id='checked-"+username+"'>" + displayname + "</div>"));
            if (!checked[username]) $("#checked-"+username).addClass("left");
        });
        checked[username] = true;
    }

    $("#main-"+username).removeClass("left");
    var checkedEntry = $("#checked-" + username);
    checkedEntry.removeClass("banned");
    checkedEntry.removeClass("left");
}

function ban(channel, username, reason) {
    console.log({"type": "ban", "channel": channel, "username": username, "reason": reason});
    $("#main-"+username).remove();
    if (!$("checked-"+username).length) delete checked[username];
    $("#checked-"+username).addClass("banned");
    if (username in checked) {
        checked[username] = false;
    }
}

function part(channel, username, self) {
    console.log({"type": "part", "channel": channel, "username": username, "self": self});
    $("#main-"+username).addClass("left");
    $("#checked-"+username).addClass("left");
    if (username in checked) {
        checked[username] = false;
    }
}

function join(channel, username, self) {
    console.log({"type": "join", "channel": channel, "username": username, "self": self});
    $("#main-"+username).removeClass("left");
    $("#checked-"+username).removeClass("left");
    if (username in checked) {
        checked[username] = true;
    }
}

function setup() {
    var dialogConfig = $("#dialog-config");
    dialogConfig.dialog( "close" );

    var name = $("#name");
    var title = $("#title");
    console.log("Setting up channel "+name.val());

    title.text("");
    //noinspection JSUnresolvedFunction
    client.getChannels().forEach(function(channel) {
        client.part(channel);
    });
    //noinspection JSUnresolvedFunction
    client.join("#"+name.val().toLowerCase()).then(function() {
        title.text(name.val());
        main_channel = "#"+name.val().toLowerCase();
        $("#table-main").empty();
        $("#checked-main").empty();
    }).catch(function(e) {
        console.log(e);
        dialogConfig.dialog( "open" );
    });
}

function init_ui() {
    var menuConfig = $("#menu-config");
    var dialogConfig = $("#dialog-config");

    $("#tabs").tabs();
    menuConfig.button({icons: {primary: "ui-icon-gear"}, text: false});
    dialogConfig.dialog({autoOpen: false, modal: true, dialogClass: "no-close", buttons: [
        {text: "OK", click: setup}
    ]});
    menuConfig.click(function() {dialogConfig.dialog( "open" ); });
    dialogConfig.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        setup();
    });

    var menuHelp = $("#menu-help");
    var dialogHelp = $("#dialog-help");
    menuHelp.button({icons: {primary: "ui-icon-help"}, text: false});
    dialogHelp.dialog({autoOpen: false, modal: true});
    menuHelp.click(function() {dialogHelp.dialog( "open" ); });
}