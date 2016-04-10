 var arrSlotLimiter = new Array();
 $var.lastSlotWin = "";
 $var.lastSlotLoss = "";

 $.SlotCommand = {
     SlotBonus: (parseInt($.inidb.get('slotMachine', 'slotBonus')) ? parseInt($.inidb.get('slotMachine', 'slotBonus')) : 1),
     SlotEmote1: ($.inidb.get('slotMachine', 'slotEmote1') ? $.inidb.get('slotMachine', 'slotEmote1') : "Kappa "),
     SlotEmote2: ($.inidb.get('slotMachine', 'slotEmote2') ? $.inidb.get('slotMachine', 'slotEmote2') : "KappaPride "),
     SlotEmote3: ($.inidb.get('slotMachine', 'slotEmote3') ? $.inidb.get('slotMachine', 'slotEmote3') : "BloodTrail "),
     SlotEmote4: ($.inidb.get('slotMachine', 'slotEmote4') ? $.inidb.get('slotMachine', 'slotEmote4') : "MrDestructoid "),
     SlotEmote5: ($.inidb.get('slotMachine', 'slotEmote5') ? $.inidb.get('slotMachine', 'slotEmote5') : "<3 "),
     SlotEmote6: ($.inidb.get('slotMachine', 'slotEmote6') ? $.inidb.get('slotMachine', 'slotEmote6') : "deIlluminati "),
     SlotEmote7: ($.inidb.get('slotMachine', 'slotEmote7') ? $.inidb.get('slotMachine', 'slotEmote7') : "VaultBoy "),
     SlotReward1: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward1')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward1')) : 20),
     SlotReward2: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward2')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward2')) : 30),
     SlotReward3: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward3')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward3')) : 40),
     SlotReward4: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward4')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward4')) : 50),
     SlotReward5: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward5')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward5')) : 60),
     SlotReward6: (parseInt($.inidb.get('slotMachine', 'slotEmoteReward6')) ? parseInt($.inidb.get('slotMachine', 'slotEmoteReward6')) : 70),
     SlotJackpot: (parseInt($.inidb.get('slotMachine', 'slotJackpot')) ? parseInt($.inidb.get('slotMachine', 'slotJackpot')) : 300),
     SeeEmote7Reward: (parseInt($.inidb.get('slotMachine', 'slotSeeingEmoteReward7')) ? parseInt($.inidb.get('slotMachine', 'slotSeeingEmoteReward7')) : 10),
     DoubleEmoteReward7: (parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward7')) ? parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward7')) : 60),
     DoubleEmoteReward6: (parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward6')) ? parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward6')) : 10),
     DoubleEmoteReward5: (parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward5')) ? parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward5')) : 5),
     DoubleEmoteReward4: (parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward4')) ? parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward4')) : 3),
     DoubleEmoteReward3: (parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward3')) ? parseInt($.inidb.get('slotMachine', 'slotDoubleEmoteReward3')) : 3),
     HalfReward: (parseInt($.inidb.get('slotMachine', 'slotHalfRewards')) ? parseInt($.inidb.get('slotMachine', 'slotHalfRewards')) : 1)
 }

 $.on('command', function(event) {
     var sender = event.getSender().toLowerCase();
     var username = $.username.resolve(sender);
     var points = $.inidb.get('points', sender);
     var command = event.getCommand();
     var argsString = event.getArguments().trim();
     var args = event.getArgs();
     var s;
     var action = args[0];

     if (command.equalsIgnoreCase("slot")) {
         if (argsString.isEmpty()) {
             var found = false;
             var i;

             for (i = 0; i < arrSlotLimiter.length; i++) {
                 if (arrSlotLimiter[i][0].equalsIgnoreCase(username)) {
                     found = true;
                 }
             }

             if (found === false) {
                 arrSlotLimiter.push(new Array(username));
             }

             if (args.length === 0 && $.moduleEnabled("./systems/pointSystem.js")) {
                 var b1 = $.randRange(1, 1000);
                 var b2 = $.randRange(1, 1000);
                 var b3 = $.randRange(1, 1000);
                 //b1
                 if (b1 <= 25) {
                     var symbol1 = $.SlotCommand.SlotEmote7;
                 }
                 if (b1 > 25 && b1 <= 75) {
                     var symbol1 = $.SlotCommand.SlotEmote6;
                 }
                 if (b1 > 75 && b1 <= 175) {
                     var symbol1 = $.SlotCommand.SlotEmote5;
                 }
                 if (b1 > 175 && b1 <= 300) {
                     var symbol1 = $.SlotCommand.SlotEmote4;
                 }
                 if (b1 > 300 && b1 <= 450) {
                     var symbol1 = $.SlotCommand.SlotEmote3;
                 }
                 if (b1 > 450 && b1 <= 700) {
                     var symbol1 = $.SlotCommand.SlotEmote2;
                 }
                 if (b1 > 700) {
                     var symbol1 = $.SlotCommand.SlotEmote1;
                 }
                 //b2
                 if (b2 <= 25) {
                     var symbol2 = $.SlotCommand.SlotEmote7;
                 }
                 if (b2 > 25 && b2 <= 75) {
                     var symbol2 = $.SlotCommand.SlotEmote6;
                 }
                 if (b2 > 75 && b2 <= 175) {
                     var symbol2 = $.SlotCommand.SlotEmote5;
                 }
                 if (b2 > 175 && b2 <= 300) {
                     var symbol2 = $.SlotCommand.SlotEmote4;
                 }
                 if (b2 > 300 && b2 <= 450) {
                     var symbol2 = $.SlotCommand.SlotEmote3;
                 }
                 if (b2 > 450 && b2 <= 700) {
                     var symbol2 = $.SlotCommand.SlotEmote2;
                 }
                 if (b2 > 700) {
                     var symbol2 = $.SlotCommand.SlotEmote1;
                 }
                 //b3
                 if (b3 <= 25) {
                     var symbol3 = $.SlotCommand.SlotEmote7;
                 }
                 if (b3 > 25 && b3 <= 75) {
                     var symbol3 = $.SlotCommand.SlotEmote6;
                 }
                 if (b3 > 75 && b3 <= 175) {
                     var symbol3 = $.SlotCommand.SlotEmote5;
                 }
                 if (b3 > 175 && b3 <= 300) {
                     var symbol3 = $.SlotCommand.SlotEmote4;
                 }
                 if (b3 > 300 && b3 <= 450) {
                     var symbol3 = $.SlotCommand.SlotEmote3;
                 }
                 if (b3 > 450 && b3 <= 700) {
                     var symbol3 = $.SlotCommand.SlotEmote2;
                 }
                 if (b3 > 700) {
                     var symbol3 = $.SlotCommand.SlotEmote1;
                 }

                 var lost = new Array(0); //Add loss messages.
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-1"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-2"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-3", sender));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-4"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-5"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-6"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-7"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-8"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-9", sender));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-10", sender));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-11"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-12"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-13"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-14"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-15"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-16"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-17"));
                 lost.push($.lang.get("net.quorrabot.slotmachine.lose-18"));

                 var win = new Array(0); //Add win messages
                 win.push($.lang.get("net.quorrabot.slotmachine.win-1"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-2"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-3"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-4"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-5"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-6"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-7"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-8"));
                 win.push($.lang.get("net.quorrabot.slotmachine.win-9"));


                 if (points === null) {
                     points = 0;
                 }

                 if (symbol1 == symbol2 && symbol2 == symbol3) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     if (symbol1 == $.SlotCommand.SlotEmote1) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward1 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward1 * $.SlotCommand.SlotBonus));
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote2) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward2 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward2) * $.SlotCommand.SlotBonus);
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote3) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward3 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward3) * $.SlotCommand.SlotBonus);
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote4) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward4 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward4) * $.SlotCommand.SlotBonus);
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote5) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward5 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward5) * $.SlotCommand.SlotBonus);
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote6) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotReward6 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotReward6) * $.SlotCommand.SlotBonus);
                     }
                     if (symbol1 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-jackpot", symbol1, symbol2, symbol3, username, ($.SlotCommand.SlotJackpot * $.SlotCommand.SlotBonus), $.pointNameMultiple));
                         $.inidb.incr('points', sender, ($.SlotCommand.SlotJackpot) * $.SlotCommand.SlotBonus);
                     }
                 } else if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward) * $.SlotCommand.SlotBonus);
                     if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1)) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward7 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward7) * $.SlotCommand.SlotBonus);
                     }
                 } else if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote7 && $.SlotCommand.HalfReward == 1)) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward7 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward7) * $.SlotCommand.SlotBonus);
                     if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward) * $.SlotCommand.SlotBonus);
                     }
                 } else if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote6 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote6 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote6 && $.SlotCommand.HalfReward == 1)) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward6 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward6) * $.SlotCommand.SlotBonus);
                     if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward) * $.SlotCommand.SlotBonus);
                     }
                 } else if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote3 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote3 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote3 && $.SlotCommand.HalfReward == 1)) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward5 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward5) * $.SlotCommand.SlotBonus);
                     if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward) * $.SlotCommand.SlotBonus);
                     }
                 } else if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote4 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote4 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote4 && $.SlotCommand.HalfReward == 1)) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward4 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward4) * $.SlotCommand.SlotBonus);
                     if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward) * $.SlotCommand.SlotBonus);
                     }
                 } else if ((symbol1 == symbol2 && symbol1 == $.SlotCommand.SlotEmote5 && $.SlotCommand.HalfReward == 1) || (symbol1 == symbol3 && symbol1 == $.SlotCommand.SlotEmote5 && $.SlotCommand.HalfReward == 1) || (symbol3 == symbol2 && symbol3 == $.SlotCommand.SlotEmote5 && $.SlotCommand.HalfReward == 1)) {
                     do {
                         s = $.randElement(win);
                     } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-half-win", symbol1, symbol2, symbol3, username, ($.SlotCommand.DoubleEmoteReward3 * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                     $.inidb.incr('points', sender, ($.SlotCommand.DoubleEmoteReward3) * $.SlotCommand.SlotBonus);
                     if (symbol1 == $.SlotCommand.SlotEmote7 || symbol2 == $.SlotCommand.SlotEmote7 || symbol3 == $.SlotCommand.SlotEmote7) {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-saw-one", symbol1, symbol2, symbol3, username, $.SlotCommand.SlotEmote7, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus), $.pointNameMultiple, s));
                         $.inidb.incr('points', sender, ($.SlotCommand.SeeEmote7Reward * $.SlotCommand.SlotBonus));
                     }
                 } else {
                     do {
                         s = $.randElement(lost);
                     } while (s.equalsIgnoreCase($var.lastRandomLost) && lost.length > 1);

                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-lost", symbol1, symbol2, symbol3, s));
                 }
             }
         }



         if (args.length >= 2) {

             if (action.equalsIgnoreCase("bonus") && !argsString.isEmpty()) {
                 if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
                 }
                 if (isNaN(args[1]) || args[1] < 0) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.bonus-usage"));
                     return;
                 } else {
                     $.inidb.set('slotMachine', 'slotBonus', args[1]);
                     $.SlotCommand.SlotBonus = parseInt(args[1]);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-multiplier", $.SlotCommand.SlotBonus));
                 }
             }

             if (action.equalsIgnoreCase("emote")) {
                 if (!argsString.isEmpty()) {
                     if (!$.isModv3(sender, event.getTags())) {
                         $.say($.getWhisperString(sender) + $.modmsg);
                         return;
                     }
                     if (args[1].equalsIgnoreCase("1") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote1', args[2]);
                         $.SlotCommand.SlotEmote1 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote1", $.SlotCommand.SlotEmote1));
                     } else if (args[1].equalsIgnoreCase("2") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote2', args[2]);
                         $.SlotCommand.SlotEmote2 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote2", $.SlotCommand.SlotEmote2));
                     } else if (args[1].equalsIgnoreCase("3") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote3', args[2]);
                         $.SlotCommand.SlotEmote3 = args[2] + " ";
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote3", $.SlotCommand.SlotEmote3));
                     } else if (args[1].equalsIgnoreCase("4") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote4', args[2]);
                         $.SlotCommand.SlotEmote4 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote4", $.SlotCommand.SlotEmote4));
                     } else if (args[1].equalsIgnoreCase("5") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote5', args[2]);
                         $.SlotCommand.SlotEmote4 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote5", $.SlotCommand.SlotEmote5));
                     } else if (args[1].equalsIgnoreCase("6") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote6', args[2]);
                         $.SlotCommand.SlotEmote6 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote6", $.SlotCommand.SlotEmote6));
                     } else if (args[1].equalsIgnoreCase("7") && args[2] != null) {
                         $.inidb.set('slotMachine', 'slotEmote7', args[2]);
                         $.SlotCommand.SlotEmote7 = args[2];
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote7", $.SlotCommand.SlotEmote7));
                     } else {
                         $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote-list", $.SlotCommand.SlotEmote1, $.SlotCommand.SlotEmote2, $.SlotCommand.SlotEmote3, $.SlotCommand.SlotEmote4, $.SlotCommand.SlotEmote5, $.SlotCommand.SlotEmote6, $.SlotCommand.SlotEmote7));
                     }
                 }
             }
             
             if (action.equalsIgnoreCase("reward") && !argsString.isEmpty()) {
                 if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
                 }
                 if (isNaN(args[2]) || args[2] < 0) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.reward-usage"));
                     return;
                 } else if (args[1].equalsIgnoreCase("1") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward1', args[2]);
                     $.SlotCommand.SlotReward1 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward1", $.SlotCommand.SlotEmote1, $.SlotCommand.SlotReward1));
                 } else if (args[1].equalsIgnoreCase("2") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward2', args[2]);
                     $.SlotCommand.SlotReward2 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward2", $.SlotCommand.SlotEmote2, $.SlotCommand.SlotReward2));
                 } else if (args[1].equalsIgnoreCase("3") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward3', args[2]);
                     $.SlotCommand.SlotReward3 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward3", $.SlotCommand.SlotEmote3, $.SlotCommand.SlotReward3));
                 } else if (args[1].equalsIgnoreCase("4") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward4', args[2]);
                     $.SlotCommand.SlotReward4 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward4", $.SlotCommand.SlotEmote4, $.SlotCommand.SlotReward4));
                 } else if (args[1].equalsIgnoreCase("5") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward5', args[2]);
                     $.SlotCommand.SlotReward5 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward5", $.SlotCommand.SlotEmote5, $.SlotCommand.SlotReward5));
                 } else if (args[1].equalsIgnoreCase("6") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward6', args[2]);
                     $.SlotCommand.SlotReward6 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward6", $.SlotCommand.SlotEmote6, $.SlotCommand.SlotReward6));
                 } else if (args[1].equalsIgnoreCase("7") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotEmoteReward7', args[2]);
                     $.SlotCommand.SlotJackpot = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward7", $.SlotCommand.SlotEmote7, $.SlotCommand.SlotJackpot));
                 } else {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward-list", $.SlotCommand.SlotEmote1, $.SlotCommand.SlotReward1, $.SlotCommand.SlotEmote2, $.SlotCommand.SlotReward2, $.SlotCommand.SlotEmote3, $.SlotCommand.SlotReward3, $.SlotCommand.SlotEmote4, $.SlotCommand.SlotReward4, $.SlotCommand.SlotEmote5, $.SlotCommand.SlotReward5, $.SlotCommand.SlotEmote6, $.SlotCommand.SlotReward6, $.SlotCommand.SlotEmote7, $.SlotCommand.SlotJackpot));
                 }

             }

             if (action.equalsIgnoreCase("halfreward") && !argsString.isEmpty()) {
                 if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
                 }
                 if (args[1].equalsIgnoreCase("on")) {
                     $.inidb.set('slotMachine', 'slotHalfRewards', 1);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.halfrewards-on"));
                     return;
                 }
                 if (args[1].equalsIgnoreCase("off")) {
                     $.inidb.set('slotMachine', 'slotHalfRewards', 0);
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.halfrewards-off"));
                     return;
                 }
                 if (args[2] != null && isNaN(args[2]) || args[2] < 0) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.halfreward-usage"));
                    return;
                 } else if (args[1].equalsIgnoreCase("3") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotDoubleEmoteReward3', args[2]);
                     $.SlotCommand.DoubleEmoteReward3 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward", $.SlotCommand.SlotEmote3, $.SlotCommand.DoubleEmoteReward3));
                 } else if (args[1].equalsIgnoreCase("4") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotDoubleEmoteReward4', args[2]);
                     $.SlotCommand.DoubleEmoteReward4 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward", $.SlotCommand.SlotEmote4, $.SlotCommand.DoubleEmoteReward4));
                 } else if (args[1].equalsIgnoreCase("5") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotDoubleEmoteReward5', args[2]);
                     $.SlotCommand.DoubleEmoteReward5 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward", $.SlotCommand.SlotEmote5, $.SlotCommand.DoubleEmoteReward5));
                 } else if (args[1].equalsIgnoreCase("6") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotDoubleEmoteReward6', args[2]);
                     $.SlotCommand.DoubleEmoteReward6 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward", $.SlotCommand.SlotEmote6, $.SlotCommand.DoubleEmoteReward6));
                 } else if (args[1].equalsIgnoreCase("7") && args[2] != null) {
                     $.inidb.set('slotMachine', 'slotDoubleEmoteReward7', args[2]);
                     $.SlotCommand.DoubleEmoteReward7 = args[2];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward", $.SlotCommand.SlotEmote7, $.SlotCommand.DoubleEmoteReward7));
                 } else if (!args[1].equalsIgnoreCase("on") && !args[1].equalsIgnoreCase("off")) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward-list", $.SlotCommand.SlotEmote3, $.SlotCommand.DoubleEmoteReward3, $.SlotCommand.SlotEmote4, $.SlotCommand.DoubleEmoteReward4, $.SlotCommand.SlotEmote5, $.SlotCommand.DoubleEmoteReward5, $.SlotCommand.SlotEmote6, $.SlotCommand.DoubleEmoteReward6, $.SlotCommand.SlotEmote7, $.SlotCommand.DoubleEmoteReward7));
                 }
             }

             if (action.equalsIgnoreCase("seereward") && !argsString.isEmpty()) {
                 if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
                 }
                 if (isNaN(args[1]) || args[1] < 0) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.seereward-usage"));
                     return;
                 }
                 if (args[1] != null) {
                     $.inidb.set('slotMachine', 'slotSeeingEmoteReward7', args[1]);
                     $.SlotCommand.SeeEmote7Reward = args[1];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.seeone-emote7-change", $.SlotCommand.SlotEmote7, $.SlotCommand.SeeEmote7Reward));
                 } else {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.seeone-emote7", $.SlotCommand.SlotEmote7, $.SlotCommand.SeeEmote7Reward));
                 }

             }

             if (action.equalsIgnoreCase("jackpot") && !argsString.isEmpty()) {
                 if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
                 }
                 if (isNaN(args[1]) || args[1] < 0) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.jackpot-usage"));
                     return;
                 }
                 if (args[1] != null) {
                     $.inidb.set('slotMachine', 'slotJackpot', args[1]);
                     $.SlotCommand.SlotJackpot = args[1];
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.jackpot-amount-change", $.SlotCommand.SlotJackpot));
                 } else {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.jackpot-amount", $.SlotCommand.SlotJackpot));
                 }
             }
         }
         
         if (args.length == 1) {
             if (!$.isModv3(sender, event.getTags())) {
                     $.say($.getWhisperString(sender) + $.modmsg);
                     return;
             } else if (action.equalsIgnoreCase("emotes") || action.equalsIgnoreCase("emote")) {
                 $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-emote-list", $.SlotCommand.SlotEmote1, $.SlotCommand.SlotEmote2, $.SlotCommand.SlotEmote3, $.SlotCommand.SlotEmote4, $.SlotCommand.SlotEmote5, $.SlotCommand.SlotEmote6, $.SlotCommand.SlotEmote7));
             } else if (action.equalsIgnoreCase("rewards") || action.equalsIgnoreCase("reward")) {
                 $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine-reward-list", $.SlotCommand.SlotEmote1, $.SlotCommand.SlotReward1, $.SlotCommand.SlotEmote2, $.SlotCommand.SlotReward2, $.SlotCommand.SlotEmote3, $.SlotCommand.SlotReward3, $.SlotCommand.SlotEmote4, $.SlotCommand.SlotReward4, $.SlotCommand.SlotEmote5, $.SlotCommand.SlotReward5, $.SlotCommand.SlotEmote6, $.SlotCommand.SlotReward6, $.SlotCommand.SlotEmote7, $.SlotCommand.SlotJackpot));
             } else if (action.equalsIgnoreCase("seereward") || action.equalsIgnoreCase("seerewards")) {
                 $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.seeone-emote7", $.SlotCommand.SlotEmote7, $.SlotCommand.SeeEmote7Reward));
             } else if (action.equalsIgnoreCase("halfreward") || action.equalsIgnoreCase("halfrewards")) {
                 $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.double-reward-list", $.SlotCommand.SlotEmote3, $.SlotCommand.DoubleEmoteReward3, $.SlotCommand.SlotEmote4, $.SlotCommand.DoubleEmoteReward4, $.SlotCommand.SlotEmote5, $.SlotCommand.DoubleEmoteReward5, $.SlotCommand.SlotEmote6, $.SlotCommand.DoubleEmoteReward6, $.SlotCommand.SlotEmote7, $.SlotCommand.DoubleEmoteReward7));
             } else if (action.equalsIgnoreCase("bonus") || action.equalsIgnoreCase("config") || action.equalsIgnoreCase("jackpot")) {
                 if (parseInt($.inidb.get('slotMachine', 'slotHalfRewards')) == 1) {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.config-half-on", $.SlotCommand.SlotBonus, $.SlotCommand.SlotJackpot));
                 } else {
                     $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.config-half-off", $.SlotCommand.SlotBonus, $.SlotCommand.SlotJackpot));
                 }
             } else {
                 $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.slotmachine.usage"));

             }
         }
     }
 });

 $.registerChatCommand("./commands/slotMachineCommand.js", "slot");