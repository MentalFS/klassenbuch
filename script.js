var client;

var dialogConfig;

function main() {
    dialogConfig = $("#dialog-config");

    init_ui();

    //noinspection JSPotentiallyInvalidConstructorUsage
    client = new tmi.client({connection: {reconnect: true}});
    //noinspection JSUnresolvedFunction
    client.connect();
    client.addListener("message", message);

    dialogConfig.dialog("open");
}

function message(channel, user, message, self) {
    console.log({"channel": channel, "user": user, "message": message, "self": self});
    if (!$("#main-"+user["username"]).length) $("#table-main").append($("<tr id='main-"+user["username"]+"'><td><input type='checkbox'></td><td>"+user["display-name"]+"</td></tr>"));
}

function setup() {
    dialogConfig.dialog( "close" );

    var name = $("#name");
    var title = $("#title");

    console.log("Setting up channel "+name.val());

    title.text("");
    //noinspection JSUnresolvedFunction
    client.getChannels().forEach(function(channel) {
        client.part(channel);
    });
    client.join("#"+name.val()).then(function() {
        title.text(name.val());
    }).catch(function(e) {
        console.log(e);
        dialogConfig.dialog( "open" );
    });
}

function init_ui() {
    $("#tabs").tabs();
    var menuConfig = $("#menu-config");
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