$.DonationHandler = {
    DonationType: ($.inidb.get('settings', 'donationtype') ? $.inidb.get('settings', 'donationtype') : "text"),
    CheckerStorePath: ($.inidb.get('settings', 'checker_storepath') ? $.inidb.get('settings', 'checker_storepath') : "./addons/donationchecker/latestdonation.txt"),
    DonationToggle: (parseInt($.inidb.get('settings', 'donation_toggle')) ? parseInt($.inidb.get('settings', 'donation_toggle')) : 1),
    DonationTASayMsg: ($.inidb.get('settings', 'donationtasaymsg') ? $.inidb.get('settings', 'donationtasaymsg') : 0),
}


$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var args = event.getArgs();
    var argsString = event.getArguments().trim();
    
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }
    
    if (command.equalsIgnoreCase("donationalert")) {
        if (!$.isAdmin(sender)) { // added this check so people can't spam the usage.
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } 

        var action = args[0];

        if (args.length == 0) { // added usage
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-usage"));
            return;
        }
        
        if (action.equalsIgnoreCase("type")) {
            if (!$.isAdmin(sender)) { // added this check so people can't spam the usage.
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            if (args[1]==null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-type", $.DonationHandler.DonationType));
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-usage"));
            }
        
            if (args[1].equalsIgnoreCase("twitchalerts") | args[1].equalsIgnoreCase("text")) {
                $.DonationHandler.DonationType = args[1].toLowerCase();
                $.inidb.set("settings","donationtype",$.DonationHandler.DonationType);
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-set-type", $.DonationHandler.DonationType));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-usage"));
                return;
            }
        }
        
        
        
        if (action.equalsIgnoreCase("filepath")) {
            if (!$.isAdmin(sender)) {
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            
            if(args[1]!=null) {
                while (args[1].indexOf('\\') != -1 && args[1] != "" && args[1] != null) {
                    args[1] = args[1].replace('\\', '/');
                }
                $.inidb.set('settings','checker_storepath', args[1]);
                $.DonationHandler.CheckerStorePath = args[1];
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.new-file-path-set"));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.current-file-path", $.DonationHandler.CheckerStorePath));
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donationalert-usage"));
                return;   
            }
        }

        if (action.equalsIgnoreCase("toggle")) {
            if ($.DonationHandler.DonationToggle == 1) {
                $.inidb.set('settings','donation_toggle', 0);
                $.DonationHandler.DonationToggle = 0;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donation-toggle-off"));
                return;
            } else {
                $.inidb.set('settings','donation_toggle', 1);
                $.DonationHandler.DonationToggle = 1;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donation-toggle-on"));
                return;
            }
        }
        
        if (action.equalsIgnoreCase("saymsg")) {
            if ($.DonationHandler.DonationToggle == 1) {
                $.inidb.set('settings','donationtasaymsg', 0);
                $.DonationHandler.DonationToggle = 0;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donation-saymsg-off"));
                return;
            } else {
                $.inidb.set('settings','donationtasaymsg', 1);
                $.DonationHandler.DonationToggle = 1;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.donationhandler.donation-saymsg-on"));
                return;
            }
        }
    }
});


//Q: why is there a timeout delay here before a timer? seems redundant no?
//A: the timeout sets a delay to start the timer, otherwise the timer won't detect if a module is disabled (because it hasnt loaded in yet)
setTimeout(function(){ 
    if ($.moduleEnabled("./handlers/donationHandler.js") && $.DonationHandler.DonationToggle == 1) {
        $.timer.addTimer("./handlers/donationHandler.js", "currdonation", true, function() {
            if(!$.readFile($.DonationHandler.CheckerStorePath)) {
                return;
            }
            
            $.currDonation = $.readFile($.DonationHandler.CheckerStorePath);

            if($.DonationHandler.DonationType=="twitchalerts") {
                $.tadata = $.twitchalerts.GetChannelDonations();
                $.tadonator = $.tadata[0];
                $.taamount = $.tadata[1];
                $.tamsg = $.tadata[2];
                var taDonation = $.tadata[0] + ": " + $.tadata[1];
                if ($.currDonation==null || $.currDonation.toString() != taDonation) {
                    $.writeToFile(taDonation, $.DonationHandler.CheckerStorePath, false);
                    //$.inidb.set("settings", "lastdonation", taDonation);
                }
            }
            
            
            if ($.currDonation!=null || $.currDonation.toString() != $.inidb.get("settings", "lastdonation") || $.currDonation.toString() != "") {

                    $.inidb.set("settings", "lastdonation", $.readFile($.DonationHandler.CheckerStorePath));
                    if ($.DonationHandler.DonationToggle == 1) {
                        if($.DonationHandler.DonationType=="twitchalerts") {
                            if($.DonationHandler.DonationTASayMsg==0) {
                                $.say($.lang.get("net.quorrabot.donationhandler.new-donation", $.tadonator, $.taamount));
                            } else {
                                $.say($.lang.get("net.quorrabot.donationhandler.new-donation-with-message", $.tadonator, $.taamount, $.tamsg));
                            }
                        } else {
                            $.say($.lang.get("net.quorrabot.donationhandler.new-donation-text", $.readFile($.DonationHandler.CheckerStorePath)));
                        }
                    }

            }
            
        }, 10 * 1000);
    }
    $.registerChatCommand("./handlers/donationHandler.js", "donationalert", "mod");
}, 10 * 1000);
