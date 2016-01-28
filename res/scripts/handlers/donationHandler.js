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
                
                if($.tadata[0]=="" | $.tadata[1]=="" | $.tadata[3]=="") {
                    return;
                }
                
                $.tadonator = $.tadata[0];
                $.taamount = $.tadata[1];
                $.tamsg = $.tadata[2];
                $.tacreated = $.tadata[3];
                
                //initiate date formatter
                var df = new java.text.SimpleDateFormat( "yyyy-MM-dd'T'hh:mm:ssz" );

                //parse created_at from TwitchAlerts, which is received in GMT
                if ($.tacreated.endsWith( "Z" )) {
                    $.tacreated = $.tacreated.substring( 0, $.tacreated.length() - 1) + "GMT-00:00";
                    //$.say(createdAt);
                } else {
                    var inset = 6;
                    var s0 = $.tacreated.substring( 0, $.tacreated.length() - inset );
                    var s1 = $.tacreated.substring( $.tacreated.length() - inset, $.tacreated.length() );
                    $.tacreated = s0 + "GMT" + s1;     
                }

                var datefmt = new java.text.SimpleDateFormat("EEEE MMMM d, yyyy @ h:mm a z");
                var gtf = new java.text.SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
                datefmt.setTimeZone(java.util.TimeZone.getTimeZone($.timezone));
                var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone($.timezone));
                var now = cal.getTime();
                var donationdate = new java.util.Date(gtf.format(df.parse( $.tacreated )));
                var currentdate = new java.util.Date(gtf.format(now));

                var diff = (currentdate.getTime() - donationdate.getTime())
                var diffHrs = diff / (60 * 60 * 1000) % 24;
                var diffMinutes = diff / (60 * 1000) % 60;

                diffHrs = diffHrs.toString().substring(0, diffHrs.toString().indexOf("."));
                diffMinutes = diffMinutes.toString().substring(0, diffMinutes.toString().indexOf("."));
                
                if (currentdate.getDate()!=donationdate.getDate() && parseInt(diffMinutes) > 30) {
                    return;
                }
                
                var taDonation = $.tadata[0] + ": " + $.tadata[1];
                if ($.currDonation.toString() != taDonation) {
                    $.writeToFile(taDonation, $.DonationHandler.CheckerStorePath, false);
                }
            }
            
            
            if ($.currDonation.toString() != $.inidb.get("settings", "lastdonation") && $.currDonation.toString() != "") {

                    $.inidb.set("settings", "lastdonation", $.readFile($.DonationHandler.CheckerStorePath));
                    if ($.DonationHandler.DonationToggle == 1) {
                        if($.DonationHandler.DonationType=="twitchalerts") {
                            if($.DonationHandler.DonationTASayMsg==0) {
                                $.say($.lang.get("net.quorrabot.donationhandler.new-donation", $.tadonator, $.taamount));
                            } else {
                                if($.tadata[1]!="") {
                                    $.say($.lang.get("net.quorrabot.donationhandler.new-donation-with-message", $.tadonator, $.taamount, $.tamsg));
                                } else {
                                    $.say($.lang.get("net.quorrabot.donationhandler.new-donation", $.tadonator, $.taamount));
                                }
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
