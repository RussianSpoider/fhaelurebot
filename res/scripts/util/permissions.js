var usergonetime = 10 * 60 * 1000;
var usercheckinterval = 3 * 60 * 1000;
var modcheckinterval = 10 * 60 * 1000;

if ($.modeOUsers == null || $.modeOUsers == undefined) {
    $.modeOUsers = [];
}

if ($.subUsers == null || $.subUsers == undefined) {
    $.subUsers = [];
}

if ($.modListUsers == null || $.modListUsers == undefined) {
    $.modListUsers = [];
}

if ($.users == null || $.users == undefined) {
    $.users = [];
}

if ($.lastjoinpart == null || $.lastjoinpart == undefined) {
    $.lastjoinpart = System.currentTimeMillis();
}

$.usergroups = [];
var keys = $.inidb.GetKeyList("groups", "");

for (var i = 0; i < keys.length; i++) {
    $.usergroups[i] = $.inidb.get("groups", keys[i]);
}

if ($.usergroups[0] == undefined || $.usergroups[0] == null || $.usergroups[0] != "Caster") {
    $.usergroups[0] = "Caster";
    $.inidb.set("grouppoints", "Caster", "0");
    $.inidb.set("groups", "0", "Caster");
}

if ($.usergroups[1] == undefined || $.usergroups[1] == null || $.usergroups[1] != "Administrator") {
    $.usergroups[1] = "Administrator";
    $.inidb.set("grouppoints", "Administrator", "0");
    $.inidb.set("groups", "1", "Administrator");
}

if ($.usergroups[2] == undefined || $.usergroups[2] == null || $.usergroups[2] != "Moderator") {
    $.usergroups[2] = "Moderator";
    $.inidb.set("grouppoints", "Moderator", "0");
    $.inidb.set("groups", "2", "Moderator");
}

if ($.usergroups[3] == undefined || $.usergroups[3] == null || $.usergroups[3] != "Subscriber") {
    $.usergroups[3] = "Subscriber";
    $.inidb.set("grouppoints", "Subscriber", "0");
    $.inidb.set("groups", "3", "Subscriber");
}

if ($.usergroups[4] == undefined || $.usergroups[4] == null || $.usergroups[4] != "Donator") {
    $.usergroups[4] = "Donator";
    $.inidb.set("grouppoints", "Donator", "0");
    $.inidb.set("groups", "4", "Donator");
}

if ($.usergroups[5] == undefined || $.usergroups[5] == null || $.usergroups[5] != "Hoster") {
    $.usergroups[5] = "Hoster";
    $.inidb.set("grouppoints", "Hoster", "0");
    $.inidb.set("groups", "5", "Hoster");
}

if ($.usergroups[6] == undefined || $.usergroups[6] == null || $.usergroups[6] != "Regular") {
    $.usergroups[6] = "Regular";
    $.inidb.set("grouppoints", "Regular", "0");
    $.inidb.set("groups", "6", "Regular");
}

if ($.usergroups[7] == undefined || $.usergroups[7] == null || $.usergroups[7] != "Viewer") {
    $.usergroups[7] = "Viewer";
    $.inidb.set("grouppoints", "Viewer", "0");
    $.inidb.set("groups", "7", "Viewer");
}


$.isBot = function (user) {
    return user.equalsIgnoreCase($.botname);
};

$.isOwner = function (user) {
    return user.equalsIgnoreCase($.botowner);
};

$.isCaster = function (user) {
    return $.isOwner(user);
};

$.isAdmin = function (user) {
    if($.getUserGroupId(user)!=null) {
        return $.getUserGroupId(user) <= 1 || $.isCaster(user) || $.isBot(user);
    } else {
        return $.isCaster(user) || $.isBot(user);
    }
};

$.isMod = function (user) {
    return $.hasModeO(user) || $.hasModList(user) || $.isAdmin(user);
};

$.isModv3 = function (user, tags) {
    if(tags != null && tags != "{}" && tags != "") {
        return $.isAdmin(user) || tags.get("user-type").equalsIgnoreCase("mod") || $.isMod(user);
    } else {
        return $.isAdmin(user) || $.isMod(user);
    }
};

$.isSub = function (user) {
    for (var i = 0; i < $.subUsers.length; i++) {

        if ($.subUsers[i][0].equalsIgnoreCase(user)) {
            return true;
        }
    }
    
    if($.isGameWispSub(user)) {
        return true;
    }

    return false;
};

$.isSubv3 = function (user, tags) {
    if(tags != null && tags != "{}" && tags != "") {
        return (tags != null && tags != "{}" && tags.get("subscriber").equalsIgnoreCase("1")) || $.isSub(user);
    } else {
        return $.isSub(user);
    }
};

$.isTurbo = function (user, tags) {
    return (tags != null && tags != "{}" && tags.get("turbo").equalsIgnoreCase("1")) || false;
};

$.isDonator = function (user) {
    return $.inidb.get("donationlist",user) == true;
};

$.isHoster = function (user) {
    return $.isHostUser(user);
};

$.isReg = function (user) {
    return $.getUserGroupId(user) <= 6 || $.isModv3(user) ||$.isDonator(user) || $.isHoster(user) || $.isSubv3(user);
}

$.hasModeO = function (user) {
    return $.array.contains($.modeOUsers, user.toLowerCase());
};

$.hasModList = function (user) {
    return $.array.contains($.modListUsers, user.toLowerCase());
};

$.hasGroupById = function (user, id) {
    return $.getUserGroupId(user) >= id;
};

$.hasGroupByName = function (user, name) {
    return $.hasGroupById(user, $.getGroupIdByName(name));
};

$.checkDynamicGroup = function (user) {
    user = $.username.resolve(user).toLowerCase();
    var group = 7;
    
    //we don't use isMod or isModv3 here because we are skipping $.isAdmin (which is included in both)
    //we skip isAdmin because this check is for dynamic groups which do not utilize the group table
    
    if($.isCaster(user)) {
        group = 0;
    } else if ($.hasModeO(user) || $.hasModList(user)) {
        group = 2;
    } else if ($.isSub(user)) {
        group = 3;
    } else if ($.isDonator(user)) {
        group = 4;
    } else if ($.isHoster(user)) {
        group = 5;
    } else if ($.inidb.get('group', user.toLowerCase())!=null) {
        return $.inidb.get('group', user.toLowerCase());
    }
    return group;
}


$.getUserGroupId = function (user) {
    user = $.username.resolve(user);
    var group = $.inidb.get('group', user.toLowerCase());
    if (group == null) {
            group = $.checkDynamicGroup(user);
    } else if(group > 1) {
        if($.checkDynamicGroup(user) < group) {
            group = $.checkDynamicGroup(user);
        }
    } else {
        group = parseInt(group);
    }
    return group;
};

$.getUserGroupName = function (user) {
    return $.getGroupNameById($.getUserGroupId(user));
};

$.setUserGroupById = function (user, id) {
    id = id.toString();
    user = $.username.resolve(user);
    $.inidb.set('group', user.toLowerCase(), id);
};

$.setUserGroupByName = function (user, name) {
    $.setUserGroupById(user, $.getGroupIdByName(name));
};

$.getGroupNameById = function (id) {
    id = parseInt(id);
    var id2str = id.toString();

    if ($.inidb.get('groups', id2str) != null && $.inidb.get('groups', id2str) != "") {
        return $.inidb.get('groups', id2str);
    }
    return $.usergroups[7];
};

$.getGroupIdByName = function (name) {

    for (var i = 0; i < $.usergroups.length; i++) {
        if ($.usergroups[i].equalsIgnoreCase(name)) {
            return i;
        }
    }

    return 7;
};

$.reloadGroups = function () {
    $.usergroups = [];
    keys = $.inidb.GetKeyList("groups", "");
    for (var i = 0; i < keys.length; i++) {
        $.usergroups[i] = $.inidb.get("groups", keys[i]);
    }
};

$.getGroupPointMultiplier = function (playername) {
    return parseInt($.inidb.get("grouppoints", $.getUserGroupName(playername)));
};

$.on('command', function (event) {
    
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();

    var args = event.getArgs();
    var name;
    var groupid;
    var groupname;

    var i;
    var s;
    var allowed = true;
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }
    var action = args[0];


    if (command.equalsIgnoreCase("group")) {
        if (args.length > 1) {

            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }

            if(action.equalsIgnoreCase("name")) {
                if (parseInt(args[1]) >= $.usergroups.length || parseInt(args[1]) < 0) {
                    args[1] = $.usergroups.length - 1;
                }

                if ($.getGroupNameById(parseInt(args[1])).equals("Administrator")) {
                    allowed = false;

                    for (i = 0; i < $.usergroups.length; i++) {
                        if ($.usergroups[i].equals("Administrator") && i != parseInt(args[1])) {
                            allowed = true;
                        }
                    }

                    if (!allowed) {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-name-err-default"));
                        return;
                    }
                }
            
                if ($.getGroupNameById(parseInt(args[1])).equals("Moderator")) {
                    allowed = false;

                    for (i = 0; i < $.usergroups.length; i++) {
                        if ($.usergroups[i].equals("Moderator") && i != parseInt(args[1])) {
                            allowed = true;
                        }
                    }

                    if (!allowed) {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-name-err-default"));
                        return;
                    }
                }

                if ($.getGroupNameById(parseInt(args[1])).equals("Caster")) {
                    allowed = false;

                    for (i = 0; i < $.usergroups.length; i++) {
                        if ($.usergroups[i].equals("Caster") && i != parseInt(args[1])) {
                            allowed = true;
                        }
                    }

                    if (!allowed) {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-name-err-default"));
                        return;
                    }
                }

                if (parseInt(args[1]) <= 7) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-name-err-default"));
                    return;
                }

                for (var i = 0; i < $.usergroups.length; i++) {
                    if (args[1].equalsIgnoreCase($.getGroupNameById(args[i]))) {
                        groupid = $.getGroupIdByName(args[1]).toString();
                    } else {
                        groupid = args[1];
                    }
                }


                name = args[2];

                if ($.strlen(name) > 0 && allowed) {

                    $.inidb.set("groups", groupid, name);

                    var oldname = $.usergroups[parseInt(groupid)];
                    $.usergroups[parseInt(groupid)] = name;

                    $.logEvent("permissions.js", 282, username + " changed the name of the " + oldname + " group to " + name);

                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-name", oldname, name));
                    return;

                }
            }

            if (action.equalsIgnoreCase("remove") || action.equalsIgnoreCase("delete")) {
                
                if (!$.isAdmin(sender)) {
                    $.say($.getWhisperString(sender) + $.adminmsg);
                    return;
                }
                if(args[1]!=null) {
                    if(parseInt(args[1])) {
                        groupid = args[1];
                    } else {
                        if($.getGroupIdByName(args[1]) > 7) {
                            groupid = $.getGroupIdByName(args[1]);
                        } else {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-not-exists"));
                            return;
                        }
                    }
                }
                groupname = $.getGroupNameById(groupid);

                if(groupid <= 7) {
                   $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-err-default", groupid.toString()));
                   return;
                }
                
                var keys = $.inidb.GetKeyList("group", "");
                for (var i = 0; i < keys.length; i++) {
                    if ($.inidb.get("group", keys[i]) == groupid.toString()) {
                        $.inidb.set("group", keys[i], "7");
                    }
                }

                var keys2 = $.inidb.GetKeyList("grouppoints", "");
                for (var i = 0; i < keys2.length; i++) {
                    if (keys2[i] == groupid.toString()) {
                        $.inidb.del("grouppoints", keys2[i]);
                    }
                }
                
                
                $.inidb.del("groups", groupid.toString());
                $.usergroups.splice(groupid.toString());
                                

                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-remove", groupname));
                //$.setUserGroupById(args[1], $.getGroupIdByName("Viewers"));
                //$.say("Group for " + $.username.resolve(args[1]) + " reset to " + $.getUserGroupName($.username.resolve(args[1])) + "!");
                //$.logEvent("permissions.js", 183, username + " reset " + args[1] + "'s group to " + $.getUserGroupName($.username.resolve(args[1])));
                return;
            }
            
            if (action.equalsIgnoreCase("create")) {
                name = args[1];
                
                if (!$.isAdmin(sender)) {
                    $.say($.getWhisperString(sender) + $.adminmsg);
                    return;
                }
                
                for(var i=0;i<$.usergroups.length;i++) {
                    if(name.equalsIgnoreCase($.usergroups[i])) {
                        groupname = $.usergroups[i];
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-already-exists", groupname));
                        return;
                    }
                }
                
                $.inidb.set("groups", $.usergroups.length.toString(), args[1]);
                $.inidb.set("grouppoints", args[1], "0");
                $.reloadGroups();
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-create", args[1]));
                return;
            }


            if (action.equalsIgnoreCase("set") || action.equalsIgnoreCase("add") || action.equalsIgnoreCase("change")) {
                name = args[2];
                groupname;
                
                if(args[2]!=null) {
                    if(parseInt(name)) {
                        groupname = $.getGroupNameById(name);
                    } else {
                        for(var i=0;i<$.usergroups.length;i++) {
                            if(name.equalsIgnoreCase($.usergroups[i])) {
                                groupname = $.usergroups[i];
                            }
                        }
                    }
                }
                
                if(groupname==null) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-not-exists"));
                    return;
                }

                if (parseInt($.getGroupIdByName($.getUserGroupName(sender))) < parseInt($.getGroupIdByName($.getUserGroupName($.username.resolve(args[1]))))) {
                    $.setUserGroupByName(args[1], name);
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-set", $.username.resolve(args[1]), $.getUserGroupName($.username.resolve(args[1]))));
                    $.logEvent("permissions.js", 200, username + " changed " + args[1] + "'s group to " + $.getUserGroupName($.username.resolve(args[1])));
                    return;
                } else {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-set-err-above"));
                    return;
                }
                
            }
            if (action.equalsIgnoreCase("points")) {
                name = args[1];
                groupid = $.getGroupIdByName(name);
                groupname = $.getGroupNameById(groupid);

                if (name.toLowerCase() != groupname.toLowerCase()) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-not-exists"));
                    return;
                }
                if (parseInt(args[2] <= -1)) { // modified to accept !group points <group> 0 to default to !points gain <amount> - Kojitsari
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-points-err-less-than-zero"));
                    return;
                } else {
                    $.inidb.set("grouppoints", groupname, args[2].toString());
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-points-set", groupname, args[2].toString()));
                }
            }
            
            if (action.equalsIgnoreCase("qset")) {
                if (name.toLowerCase() != groupname.toLowerCase()) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-not-exists"));
                    return;
                }
                else {
                    $.setUserGroupByName(args[1], name);
                    $.logEvent("permissions.js", 200, username + " silently changed " + args[1] + "'s group to " + $.getUserGroupName($.username.resolve(args[1])));
                    return;
                }
            }
            
        } else if(args.length == 1) {
            if (action.equalsIgnoreCase("list")) {
                if (!$.isAdmin(sender)) {
                    $.say($.getWhisperString(sender) + $.adminmsg);
                    return;
                }
                
                var ranks = "";

                for (i = 0; i < $.usergroups.length; i++) {
                    if (ranks.length > 0) {
                        ranks = ranks + " - ";
                    }
                    ranks = ranks + i + " = " + $.getGroupNameById(i);
                }

                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-list", ranks));
                return;
                
            } else if($.username.resolve(args[0])) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-current-other", $.username.resolve(args[0]), $.getUserGroupName(args[0])));
                    return;
            } else {
                if (!argsString.isEmpty()) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-usage"));
                    return;
                }
            }        
        } else {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.permissions.group-current-self", username, $.getUserGroupName(sender)));
        }
    }   
        

    if (command.equalsIgnoreCase("users")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
        s = $.lang.get("net.quorrabot.permissions.users");

        for (i = 0; i < $.users.length; i++) {
            name = $.users[i][0];

            if (s.length > 18) {
                s += ", ";
            }

            s += name.toLowerCase();
        }

        $.say($.getWhisperString(sender) + s);
    }

    if (command.equalsIgnoreCase("moderators")) {
        s = $.lang.get("net.quorrabot.permissions.mods");

        for (i = 0; i < $.users.length; i++) {
            name = users[i][0];

            if ($.isMod(name.toLowerCase())) {
                if (s.length > 17) {
                    s += ", ";
                }

                s += name.toLowerCase();
            }
        }

        $.say(s);
    }

    if (command.equalsIgnoreCase("admins")) {
        s = $.lang.get("net.quorrabot.permissions.admins");

        for (i = 0; i < $.users.length; i++) {
            name = users[i][0];

            if ($.isAdmin(name.toLowerCase())) {
                if (s.length > 19) {
                    s += ", ";
                }

                s += name.toLowerCase();
            }
        }

        $.say($.getWhisperString(sender) + s);
    }
});

$.on('ircChannelMessage', function (event) {
    var sender = event.getSender().toLowerCase();
    var found = false;

    for (var i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(sender)) {
            $.users[i][1] = System.currentTimeMillis();
            found = true;
            if ($.isSubv3(event.getSender(), event.getTags()) == true) {
                $.inidb.set("subscribed", sender, "1");
            }
            break;
        }
    }

    if (!found) {
        $.users.push(new Array(sender, System.currentTimeMillis()));
    }
});


$.on('ircChannelJoin', function (event) {
    var username = event.getUser().toLowerCase();
    var found = false;

    $.lastjoinpart = System.currentTimeMillis();

    for (var i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(username)) {
            found = true;
            break;
        }
    }

    if (!found) {
        $.users.push(new Array(username, System.currentTimeMillis()));
    }
    for (i = 0; i < $.modListUsers.length; i++) {
        if ($.modListUsers[i].equalsIgnoreCase(username)) {
            $.modeOUsers.push(username);
            if ($.isAdmin(username) == false && $.isBot(username) == false) {
                println("+Moderator: " + username);
            }
        }
    }
});

$.on('ircChannelJoinUpdate', function (event) {
    var username = event.getUser().toLowerCase();
    var found = false;

    $.lastjoinpart = System.currentTimeMillis();

    for (var i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(username)) {
            found = true;
            break;
        }
    }

    if (!found) {
        $.users.push(new Array(username, System.currentTimeMillis()));
    }
    for (i = 0; i < $.modListUsers.length; i++) {
        if ($.modListUsers[i].equalsIgnoreCase(username)) {
            $.modeOUsers.push(username);
            if ($.isAdmin(username) == false && $.isBot(username) == false) {
                println("+Moderator: " + username);
            }
        }
    }
});

$.on('ircChannelLeave', function (event) {
    var username = event.getUser().toLowerCase();
    var i;
    var found = false;

    $.lastjoinpart = System.currentTimeMillis();

    for (i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(username)) {
            $.users.splice(i, 1);
            break;
        }
    }

    for (i = 0; i < $.modeOUsers.length; i++) {
        if ($.modeOUsers[i].equalsIgnoreCase(username)) {
            $.modeOUsers.splice(i, 1);
            if ($.isAdmin(username) == false && $.isBot(username) == false) {
                println("-Moderator: " + username);
            }
        }
    }
});

$.on('ircChannelUserMode', function (event) {
    var username = event.getUser().toLowerCase();
    $.inidb.set('visited', username, "visited");
    
    if (event.getMode().equalsIgnoreCase("o")) {
        if (event.getAdd() == true) {
            if ($.array.contains($.modeOUsers, username) == false) {
                $.modeOUsers.push(username);
                println("+Moderator: " + username);
            }
        } else {
            for (i = 0; i < $.modeOUsers.length; i++) {

                if ($.modeOUsers[i].equalsIgnoreCase(username)) {
                    $.modeOUsers.splice(i, 1);
                    if ($.isAdmin(username) == false && $.isBot(username) == false) {
                        println("-Moderator: " + username);
                    }
                }
            }
        }
    }
});

$.on('ircPrivateMessage', function (event) {
    if (event.getSender().equalsIgnoreCase("jtv")) {
        var message = event.getMessage().toLowerCase();
        var spl;
        var i;

        if (message.startsWith("the moderators of this channel are: ")) {
            spl = message.substring(33).split(", ");

            $.modListUsers.splice(0, $.modListUsers.length);

            for (i = 0; i < spl.length; i++) {
                $.modListUsers.push(spl[i].toLowerCase());
            }

            $.saveArray(spl, "mods.txt", false);
        } else if (message.startsWith("specialuser")) {
            spl = message.split(" ");

            if (spl[2].equalsIgnoreCase("subscriber")) {
                for (i = 0; i < $.subUsers.length; i++) {
                    if ($.subUsers[i][0].equalsIgnoreCase(spl[1])) {
                        $.subUsers[i][1] = System.currentTimeMillis() + 10000;
                        return;
                    }
                }
                
                $.subUsers.push(new Array(spl[1], System.currentTimeMillis() + 10000));
            }
        }
    }
});

$.timer.addTimer("./util/permissions.js", "modcheck", true, function () {
    $.botsession.saySilent(".mods");
}, modcheckinterval);

$.timer.addTimer("./util/permissions.js", "usercheck", true, function () {
    var curtime = System.currentTimeMillis();

    if ($.lastjoinpart + usergonetime < curtime) {
     for (var i = 0; i < $.users.length; i++) {
     if ($.users[i][1] + usergonetime < curtime) {
     $.users.splice(i, 1);
     i--;
     }
     }
     }

    for (var b = 0; b < $.subUsers.length; b++) {
        if ($.subUsers[b][1] < curtime) {
            $.subUsers.splice(b, 1);
            b--;
        }
    }
}, usercheckinterval);

$.registerChatCommand("./util/permissions.js", "group");
$.registerChatCommand("./util/permissions.js", "users");
$.registerChatCommand("./util/permissions.js", "moderators");
$.registerChatCommand("./util/permissions.js", "admins");
