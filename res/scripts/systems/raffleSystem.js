$.raffleToggle = $.inidb.get("settings", "raffleToggle");

if ($.raffleToggle == undefined || $.raffleToggle == null) {
    $.raffleToggle = "true";
}

$.getRewardString = function(reward) {
    if (!$.moduleEnabled("./systems/pointSystem.js") || isNaN(reward)) {
        $.raffleMode = 0;
        return reward;
    } else {
        $.raffleMode = 1;
        return $.getPointsString(Math.max(parseInt(reward), 0));
    }
}

$.enterRaffle = function(user, message) {
    // List of return codes:
    // - 0: Wrong keyword.
    // - 1: Successfully entered the raffle.
    // - 2: Raffle isn't running.
    // - 3: User already entered the raffle.
    // - 4: User doesn't have enough points to enter.
    // - 5: The broadcaster tried to enter.
    // - 6: User isn't following but following is required to enter.

    if ($.raffleRunning == 1) {
        if ($.raffleKeyword == "!raffle" && message.toLowerCase() != "!raffle") {
            return 0;
        } else if (!message.toLowerCase().contains($.raffleKeyword.toLowerCase())) {
            return 0;
        }

        if ($.array.contains($.raffleEntrants, user)) {
            return 3;
        }

        if ($.moduleEnabled("./systems/pointSystem.js") && $.rafflePrice > 0) {
            var points = $.inidb.get('points', user);

            if (points == null || isNaN(points)) {
                points = 0;
            } else {
                points = parseInt(points);
            }

            if ($.rafflePrice > points) {
                return 4;
            }

            $.inidb.decr('points', user, $.rafflePrice);
        }
        
        if ($.raffleFollowers == 1) {
                var userFollowsCheck = $.twitch.GetUserFollowsChannel($.username.resolve(user.toLowerCase()), $.channelName);
                
                if (userFollowsCheck.getInt("_http") != 200) {
                    if (user.toLowerCase() == $.channelName.toLowerCase()) {
                        return 5;
                    } else {
                        return 6;
                    }
                }
        }
    
        $.raffleEntrants.push(user);
        $.inidb.set('raffles', 'players', $.raffleEntrants); //let's make sure that the players database is updated as soon as an entry is created (if the raffle ends it's just going to wipe this and replace it with it's running array)
        $.inidb.set('raffles', 'entries', $.raffleEntrants.length); //Hey, while we're at it we can update this count at the same time.
        return 1;
    } else {
        return 2;
    }
}

//This is the beast of raffle let there be comments to explain this whole thing
$.on('command', function (event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;

    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.match(/"[^"]*"|[^\s"]+/g);
        for (var number in args){
            args[number] = args[number].replace(/"/g, "");
        }
    }
	
	//What to do when we see "!raffle" in chat
    if(command.equalsIgnoreCase("raffle")) {
        if (args.length >= 1) {
	        //create variable 'action' with the first value that comes after !raffle
            var action = args[0];
			
			//what to do if "!raffle start" or "!raffle new" or "!raffle run" is issued
            if (action.equalsIgnoreCase("start") || action.equalsIgnoreCase("new") || action.equalsIgnoreCase("run")) {
                //check to see if PointSystem is enable & that Points are enabled in settings table
                if ($.moduleEnabled("./systems/pointSystem.js") && $.inidb.get("settings", "permTogglePoints") == "true") {
                    if (!$.isModv3(sender, event.getTags())) {
                        $.say($.getWhisperString(sender) + $.modmsg);
                        return;
                    }
                } else {
                    // This is the default. If points permtoggle allows mods, allow mods here as well.
                    // If the points module is inactive, use isAdmin for safety reasons.
                    if (!$.isAdmin(sender)) {
                        $.say($.getWhisperString(sender) + $.adminmsg);
                        return;
                    }
                }
				//If the raffle is already running, you can't go running another raffle. so we will tell the command sender as such
                if ($.raffleRunning == 1) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.start-error-running"));
                    return;
                } else {
	            //The raffle isn't running, so we can start a new raffle! And set some variables
                    $.raffleTime = new Date();
                    $.raffleMonth = $.raffleTime.getMonth() + 1;
                    $.raffleDay = $.raffleTime.getDate();
                    $.raffleYear = $.raffleTime.getFullYear();
                    $.raffleDateString = $.raffleMonth + "/" + $.raffleDay + "/" + $.raffleYear;

                    $.raffleEntrants = [];
                    $.raffleMode = 0;
                    $.raffleRunning = 0;

                    $.raffleFollowers = 0;
                    $.rafflePrice = 0;
                    $.raffleKeyword = "!raffle";
                    $.raffleReward = "";
                    $.raffleWinnings = "";
                    $.raffleAutoCloseTimer = 0;

                    var i = 1;
					//we are going to use our variable integer to go through the arguments in order
					//This is done this way in order to be able to ignore arguments that aren't issues
					//so in this case we are looking to see if "!raffle start -followers" is set
                    if (args[i] != null && args[i] != undefined && (args[i].equalsIgnoreCase("-followers") || args[i].equalsIgnoreCase("-followed") || args[i].equalsIgnoreCase("-follow"))) {
                        $.raffleFollowers = 1;
                        i++;
                    }
                    //now we are going to see if "!raffle start -followers REWARD" or "!raffle start REWARD" is set
                    if (args[i] != null && args[i] != undefined && args[i].trim() != "") {
                        $.raffleReward = args[i];
                        i++;
                    }
                    //now we are going to see if "!raffle start REWARD PRICE" is set
                    //we're also ensuring that the pointSystem module is enabled
                    if ($.moduleEnabled("./systems/pointSystem.js") && args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                        $.rafflePrice = parseInt(args[i]);
                        i++;
                    }
                    //now we're going to set the keyword
                    if (args[i] != null && args[i] != undefined && args[i].trim() != "") {
                        if (args[i] == "!raffle") {
	                        //allows !raffle to be the keyword
                            $.raffleKeyword = args[i];
                            i++;
                        } else if(args[i].startsWith('!')) {
                            if ($.moduleEnabled("./systems/pointSystem.js")) {
	                            //You can't use ! in keywords (as it conflicts with other commands) - show structure with points
                                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.start-error-invalid-points"));
                                return;
                            } else {
	                            //You can't user ! in keywords - show structure without points
                                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.start-error-invalid-default"));
                                return;
                            }
                        } else {
	                        //Set the raffle keyword
                            $.raffleKeyword = args[i];
                            i++;
                        }
                    }
					//now we are going to see if a timer argument is issued
                    if (args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                        //Set Raffle's auto close timer
                        $.raffleAutoCloseTimer = parseInt(args[i]);
                        i++;
                    }

					//now lets handle the auto timer section
                    if ($.raffleAutoCloseTimer > 0) {
                        //Tell users that this is an auto closing raffle
                        setTimeout(function(){
                            $.say($.lang.get("net.quorrabot.rafflesystem.auto-close", $.raffleAutoCloseTimer));
                            return;
                        }, 1000);
                        //Remind users that raffle is an auto closing raffle
                        $.timer.addTimer("./systems/raffleSystem.js", "rraffle", true, function() {
                            $.timer.clearTimer("./systems/raffleSystem.js", "rraffle", true);
                            $.say($.lang.get("net.quorrabot.rafflesystem.auto-close2", ($.raffleAutoCloseTimer / 2)));
                            return;
                        }, ($.raffleAutoCloseTimer * 60 * 1000) / 2);
						//End the raffle
                        $.timer.addTimer("./systems/raffleSystem.js", "raffle", true, function() {
                            $.timer.clearTimer("./systems/raffleSystem.js", "raffle", true);
                            
                            //set raffle to off state
                            $.raffleRunning = 0;
                            $.inidb.set('raffles', 'running', $.raffleRunning);
							
							//notify that raffle closed with no entries, and no winners
                            if ($.raffleEntrants.length == 0) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.close-success-noentries"));
                                return;
                            }
                            
                            var i = 0;
                            
                            //Select a winner
                            do {
                                if (i > ($.raffleEntrants.length * 2)) {
                                    $.winnerUsername = null;
                                    break;
                                }
                                
                                //Randomly select a winner front entrants
                                $.winnerUsername = $.raffleEntrants[$.randRange(1, $.raffleEntrants.length) - 1];
                                
                                //Check to see if winner is a follower
                                $.winnerFollows = $.inidb.get('followed', $.winnerUsername.toLowerCase());
                                
                                if ($.raffleFollowers && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows == "1")){
                                    $.winnerFollowsCheck = $.twitch.GetUserFollowsChannel($.winnerUsername.toLowerCase(), $.channelName);
                                    //check that follower is indeed following on twitch
                                    if ($.winnerFollowsCheck.getInt("_http") == 200) {
                                        //yay they are a follower
                                        $.winnerFollows = "1";
                                    }
                                }
                                
                                i++;
                            
                            
                            } while ($.raffleFollowers == 1 && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows != "1"));
                            
                            //if all entrants aren't followers and you have followers required, tell them nobody has won
                            if ($.winnerUsername == null) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.close-success-nofollow"));
                                return;
                            }
							
							//Announce the winner (no points as reward)
                            if ($.raffleMode == 0) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.close-success-default", $.username.resolve($.winnerUsername), $.getRewardString($.raffleReward)));
                            } 
                            //announce the winner and deliver the points
                            else {
	                            //add points to winning user
                                $.inidb.incr('points', $.winnerUsername.toLowerCase(), $.raffleReward);
								//announce winner
                                $.say($.lang.get("net.quorrabot.rafflesystem.close-success-points", $.username.resolve($.winnerUsername), $.getRewardString($.raffleReward)));
                            }
							//update database with the raffle details
                            $.inidb.set('raffles', 'reward', $.raffleReward);
                            $.inidb.set('raffles', 'winner', $.winnerUsername);
                            $.inidb.set('raffles', 'price', $.rafflePrice);
                            $.inidb.set('raffles', 'mode', $.raffleMode);
                            $.inidb.set('raffles', 'follow', $.raffleFollowers);
                            $.inidb.set('raffles', 'keyword', $.raffleKeyword);
                            $.inidb.set('raffles', 'entries', $.raffleEntrants.length);
                            $.inidb.set('raffles', 'players', $.raffleEntrants);
                            $.inidb.set('raffles', 'date', $.raffleDateString);
                            $.inidb.set('raffles', 'running', $.raffleRunning);
                        }, $.raffleAutoCloseTimer * 60 * 1000);
                    }
					//if the Raffle Reward is not set, notify sender of proper usage
                    if ($.raffleReward == "") {
                        if ($.moduleEnabled("./systems/pointSystem.js")) {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.start-usage-points"));
                            return;
                        } else {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.start-usage-default"));
                            return;
                        }
                    } else {
	                   //notify room that raffle is running
                        if ($.moduleEnabled("./systems/pointSystem.js")) {
                            if ($.raffleFollowers == 1 && $.rafflePrice > 0) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-followers-price", $.getRewardString($.raffleReward), $.getPointsString($.rafflePrice), $.raffleKeyword));
                            } else if ($.raffleFollowers == 1 && $.rafflePrice <= 0) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-followers", $.getRewardString($.raffleReward), $.raffleKeyword));
                            } else if ($.raffleFollowers == 0 && $.rafflePrice > 0) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-price", $.getRewardString($.raffleReward), $.getPointsString($.rafflePrice), $.raffleKeyword));
                            } else {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-default", $.getRewardString($.raffleReward), $.raffleKeyword));
                            }
                        } else {
                            if ($.raffleFollowers == 1) {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-followers", $.getRewardString($.raffleReward), $.raffleKeyword));
                            } else {
                                $.say($.lang.get("net.quorrabot.rafflesystem.start-success-default", $.getRewardString($.raffleReward), $.raffleKeyword));
                            }
                        }
                    }
					//Raffle is now running
                    $.raffleRunning = 1;

					//Update database with new raffle details
                    $.inidb.set('raffles', 'reward', $.raffleReward);
                    $.inidb.set('raffles', 'winner', $.winnerUsername);
                    $.inidb.set('raffles', 'price', $.rafflePrice);
                    $.inidb.set('raffles', 'mode', $.raffleMode);
                    $.inidb.set('raffles', 'follow', $.raffleFollowers);
                    $.inidb.set('raffles', 'keyword', $.raffleKeyword);
                    $.inidb.set('raffles', 'date', $.raffleDateString);
                    $.inidb.set('raffles', 'running', $.raffleRunning);
                }
            //now to handle if !raffle is ended by sender using "!raffle close" or "!raffle stop" or "!raffle end" or "!raffle draw"
            } else if (action.equalsIgnoreCase("close") || action.equalsIgnoreCase("stop") || action.equalsIgnoreCase("end") || action.equalsIgnoreCase("draw")) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }
                
                //Set some raffle variables

                $.raffleTime = new Date();
                $.raffleMonth = $.raffleTime.getMonth() + 1;
                $.raffleDay = $.raffleTime.getDate();
                $.raffleYear = $.raffleTime.getFullYear();
                $.raffleDateString = $.raffleMonth + "/" + $.raffleDay + "/" + $.raffleYear;
				
				//you can't close a raffle if it's not running
                if ($.raffleRunning == 0) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.close-error-notrunning"));
                    return;
                } else {
	                
	                //clear and end Auto Timers (seeing as you are ending the raffle manually)
                    if ($.raffleAutoCloseTimer > 0) {
                        $.timer.clearTimer("./systems/raffleSystem.js", "rraffle", true);
                        $.timer.clearTimer("./systems/raffleSystem.js", "raffle", true);
                    }
                    //Set raffle to off state
                    $.raffleRunning = 0;
					
					//If there are not entrants let the room know
                    if ($.raffleEntrants.length == 0) {
                        $.say($.lang.get("net.quorrabot.rafflesystem.close-success-noentries"));
                        return;
                    }
                    
                    i = 0;
                    
                    do {
                        if (i > ($.raffleEntrants.length * 2)) {
                            $.winnerUsername = null;
                            break;
                        }
                        //randomly select a winner
                        $.winnerUsername = $.raffleEntrants[$.randRange(1, $.raffleEntrants.length) - 1];
                        
                        if ($.raffleFollowers && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows == "1")){
                            $.winnerFollowsCheck = $.twitch.GetUserFollowsChannel($.winnerUsername.toLowerCase(), $.channelName);
                            //Check to see if winner is a follower
                            if ($.winnerFollowsCheck.getInt("_http") == 200) {
	                            //yay they are a follower (this is repeated we can probably create an object for this)
                                $.winnerFollows = "1";
                            }
                        }
                        
                        i++;
                    } while ($.raffleFollowers == 1 && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows != "1"));
                    
                    //Close but no followers (when followers are required)
                    if ($.winnerUsername == null) {
                        $.say($.lang.get("net.quorrabot.rafflesystem.close-success-nofollow"));
                        return;
                    }
					
					//Announce raffle winner
                    if ($.raffleMode == 0) {
                        $.say($.lang.get("net.quorrabot.rafflesystem.close-success-default", $.username.resolve($.winnerUsername), $.getRewardString($.raffleReward)));
                    } 
                    //Announce raffle winner and deliver point rewards
                    else {
	                    //increase winner's points record in db
                        $.inidb.incr('points', $.winnerUsername.toLowerCase(), $.raffleReward);
						
						//announce winner
                        $.say($.lang.get("net.quorrabot.rafflesystem.close-success-points", $.username.resolve($.winnerUsername), $.getRewardString($.raffleReward)));
                    }
					
					//update databases
                    $.inidb.set('raffles', 'reward', $.raffleReward);
                    $.inidb.set('raffles', 'winner', $.winnerUsername);
                    $.inidb.set('raffles', 'price', $.rafflePrice);
                    $.inidb.set('raffles', 'mode', $.raffleMode);
                    $.inidb.set('raffles', 'follow', $.raffleFollowers);
                    $.inidb.set('raffles', 'keyword', $.raffleKeyword);
                    $.inidb.set('raffles', 'entries', $.raffleEntrants.length);
                    $.inidb.set('raffles', 'players', $.raffleEntrants);
                    $.inidb.set('raffles', 'date', $.raffleDateString);
                    $.inidb.set('raffles', 'running', $.raffleRunning);
                }
                
                //Let's create a resume command that will let us resume a previously opened raffle due to a bot crash, closure or power outage
            } else if (action.equalsIgnoreCase("resume")){
	            if (!$.isModv3(sender, event.getTags())) {
		            $.say($.getWhisperString(sender) + $.modmsg);
		            return;
	            }
	            if ($.raffleRunning == 0 || $.raffleRunning == undefined || $.raffleRunning == null || $.raffleRunning == "") {
		          //check to see if a raffle has been left in on state in database
		          $.raffleStoredAsRunning = parseInt($.inidb.get('raffles', 'running'));
		          
		          if ($.raffleStoredAsRunning == 1) {
			          //let's load in our raffle variables from db
					  
					  //for Raffle Entries I am not able to do a .split() and store the winning results back into
			          $.raffleEntrantsSTR = $.inidb.get('raffles', 'players').split(',');
			          $.raffleEntrants = [];
			          for(i = 0 ; i < $.raffleEntrantsSTR.length; i++){
				          rafflePlayer = $.raffleEntrantsSTR[i]
				          $.raffleEntrants.push(rafflePlayer);
			          }
			          
			          $.raffleKeyword = $.inidb.get('raffles', 'keyword');
			          $.raffleReward = $.inidb.get('raffles', 'reward');
			          $.raffleDateString = $.inidb.get('raffles', 'date');
			          $.rafflePrice = parseInt($.inidb.get('raffles', 'price'));
					  $.raffleMode = parseInt($.inidb.get('raffles', 'mode'));
					  $.raffleFollowers = parseInt($.inidb.get('raffles', 'follow'));
				
					  //Raffle is now running
					  $.raffleRunning = 1;
			          
			          //Tell the sender that the raffle has been resumed
			          
			          $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.resume-success"));
			          return;
			          
		          } else {
			          //can't resume a raffle if it's not running
			          $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.resume-error-notstoredrunning"));
			          return;
		          }
	            } else {
		            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.resume-error-running"));
		            return;
	            }   
            } else if (action.equalsIgnoreCase("repick") || action.equalsIgnoreCase("redraw")) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                $.raffleTime = new Date();
                $.raffleMonth = $.raffleTime.getMonth() + 1;
                $.raffleDay = $.raffleTime.getDate();
                $.raffleYear = $.raffleTime.getFullYear();
                $.raffleDateString = $.raffleMonth + "/" + $.raffleDay + "/" + $.raffleYear;
     
                if ($.raffleRunning == 1) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.redraw-error-running"));
                    return;
                }

                if ($.raffleEntrants.length == 0) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.redraw-error-noentries"));
                }
                
                if ($.raffleMode == 1) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.redraw-error-pointraffle", $.inidb.get('settings', 'pointNameMultiple')));
                    return;
                }
     
                i = 0;
                
                do {
                    if (i > ($.raffleEntrants.length * 2)) {
                        $.winnerUsername = null;
                        break;
                    }
                    
                    $.winnerUsername = $.raffleEntrants[$.randRange(1, $.raffleEntrants.length) - 1];
                    
                    if ($.raffleFollowers && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows == "1")){
                        $.winnerFollowsCheck = $.twitch.GetUserFollowsChannel($.winnerUsername.toLowerCase(), $.channelName);
                        
                        if ($.winnerFollowsCheck.getInt("_http") == 200) {
                            $.winnerFollows = "1";
                        }
                    }
                    
                    i++;
                } while ($.raffleFollowers == 1 && ($.winnerFollows == null || $.winnerFollows == undefined || $.winnerFollows != "1"));
                
                if ($.winnerUsername == null) {
                    $.say($.lang.get("net.quorrabot.rafflesystem.redraw-success-nofollow"));
                    return;
                }

                $.say($.lang.get("net.quorrabot.rafflesystem.redraw-success-default", $.username.resolve($.winnerUsername), $.getRewardString($.raffleReward)));

                $.inidb.set('raffles', 'reward', $.raffleReward);
                $.inidb.set('raffles', 'winner', $.winnerUsername);
                $.inidb.set('raffles', 'price', $.rafflePrice);
                $.inidb.set('raffles', 'mode', $.raffleMode);
                $.inidb.set('raffles', 'follow', $.raffleFollowers);
                $.inidb.set('raffles', 'keyword', $.raffleKeyword);
                $.inidb.set('raffles', 'entries', $.raffleEntrants.length);
                $.inidb.set('raffles', 'players', $.raffleEntrants);
                $.inidb.set('raffles', 'date', $.raffleDateString);
            } else if (action.equalsIgnoreCase("results")) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                var prevRaffleReward = $.inidb.get('raffles', 'reward');
                var prevRaffleWinner = $.inidb.get('raffles', 'winner');
                var prevRafflePrice = $.inidb.get('raffles', 'price');
                var prevRaffleMode = $.inidb.get('raffles', 'mode');
                var prevRaffleFollowers = $.inidb.get('raffles', 'follow');
                var prevRaffleKeyword = $.inidb.get('raffles', 'keyword');
                var prevRaffleEntrantsCount = $.inidb.get('raffles', 'entries');
                var prevRaffleDate = $.inidb.get('raffles', 'date');

                if (prevRaffleWinner == null) prevRaffleWinner = "None";
                if (prevRaffleWinner != null) prevRaffleWinner = $.username.resolve(prevRaffleWinner);
                if (prevRaffleMode == 0) prevRaffleMode = "Other";
                if (prevRaffleMode == 1) prevRaffleMode = "Points";
                if (prevRaffleFollowers == 0) prevRaffleFollowers = "No";
                if (prevRaffleFollowers == 1) prevRaffleFollowers = "Yes";
                if (isNaN(prevRaffleEntrantsCount)) prevRaffleEntrantsCount = 0;

                if (prevRaffleReward == null || prevRafflePrice == null || prevRaffleMode == null || prevRaffleKeyword == null || prevRaffleDate == null) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.result-error-notfound"));
                    return;
                }

                if ($.raffleRunning == 1) {
                    $.say($.lang.get("net.quorrabot.rafflesystem.result-success-running", getRewardString(prevRaffleReward), $.getPointsString(prevRafflePrice), prevRaffleMode, prevRaffleFollowers, prevRaffleKeyword, prevRaffleEntrantsCount));
                    return;
                } else {
                    $.say($.lang.get("net.quorrabot.rafflesystem.result-success-norunning", getRewardString(prevRaffleReward), $.getPointsString(prevRafflePrice), prevRaffleMode, prevRaffleFollowers, prevRaffleKeyword, prevRaffleEntrantsCount, prevRaffleWinner, prevRaffleDate));
                    return;
                }
            } else if (action.equalsIgnoreCase("entries") || action.equalsIgnoreCase("entrants")) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }

                if ($.raffleEntrants != null && $.raffleEntrants != undefined) {
                    var raffleEntrants = $.raffleEntrants;
                } else {
                    var raffleEntrants = $.inidb.get('raffles', 'players');
                }

                if (raffleEntrants == null || raffleEntrants == undefined || raffleEntrants == "undefined" || raffleEntrants[0] == "" || raffleEntrants[0] == undefined || raffleEntrants[0] == "undefined") {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-error-noresults"));
                    return;
                }

                var arrayRaffleEntrants = raffleEntrants.split(',');
                var maxRaffleEntrants = arrayRaffleEntrants.length;
                var maxResults = 15;
                var returnString = "";

                if (args[1] != null && isNaN(parseInt(args[1]))) {
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-usage"));
                    return;
                } else if (args[1] == null || parseInt(args[1]) <= 1 || maxRaffleEntrants <= maxResults) {
                    for (i = 0; i < maxResults; i++) { 
                        if (arrayRaffleEntrants[i] != null) {
                            returnString += $.username.resolve(arrayRaffleEntrants[i]) + ", ";
                        }
                    }
                    if (returnString == "") {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-error-noresults"));
                    } else {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-success", 1, Math.ceil(maxRaffleEntrants / maxResults), returnString.slice(0,-2)));
                    }
                    return;
                } else if (parseInt(args[1])) {
                    var offset = (Math.round(args[1]) - 1) * maxResults;

                    for (i = 0; i < maxResults; i++) { 
                        if (arrayRaffleEntrants[i + offset] != null) {
                            returnString += $.username.resolve(arrayRaffleEntrants[i + offset]) + ", ";
                        }
                    }
                    if (returnString == "") {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-error-noresults"));
                    } else {
                        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.entries-success", Math.round(args[1]), Math.ceil(maxRaffleEntrants / maxResults), returnString.slice(0,-2)));
                    }
                    return;
                }
            } else if (action.equalsIgnoreCase("toggle")) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.getWhisperString(sender) + $.modmsg);
                    return;
                }
                if ($.raffleToggle == "false") {
                    $.inidb.set("settings", "raffleToggle", "true");
                    $.raffleToggle = $.inidb.get('settings', 'raffleToggle');

                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.toggle-enabled"));
                } else if ($.raffleToggle == "true") {
                    $.inidb.set("settings", "raffleToggle", "false");
                    $.raffleToggle = $.inidb.get('settings', 'raffleToggle');

                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.toggle-disabled"));
                }
            }
        } else {
            if ($.raffleRunning) {
                if ($.raffleKeyword != "!raffle") {
                    if ($.moduleEnabled("./systems/pointSystem.js")) {
                        if ($.raffleFollowers == 1 && $.rafflePrice > 0) {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-followers-price", $.getRewardString($.raffleReward), $.getPointsString($.rafflePrice), $.raffleKeyword));
                        } else if ($.raffleFollowers == 1 && $.rafflePrice <= 0) {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-followers", $.getRewardString($.raffleReward), $.raffleKeyword));
                        } else if ($.raffleFollowers == 0 && $.rafflePrice > 0) {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-price", $.getRewardString($.raffleReward), $.getPointsString($.rafflePrice), $.raffleKeyword));
                        } else {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-default", $.getRewardString($.raffleReward), $.raffleKeyword));
                        }
                    } else {
                        if ($.raffleFollowers == 1) {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-followers", $.getRewardString($.raffleReward), $.raffleKeyword));
                        } else {
                            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-notcommand-default", $.getRewardString($.raffleReward), $.raffleKeyword));
                        }
                    }
                } else {
                    switch ($.enterRaffle(sender, "!raffle")) {
                        case 1:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-success"));
                            break;
                        case 2:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-notrunning", "Moderator"));
                            break;
                        case 3:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-entered"));
                            break;
                        case 4:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-notenough", $.inidb.get('settings', 'pointNameMultiple')));
                            break;
                        case 5:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-iscaster"));
                            break;
                        case 6:
                            if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-nofollow"));
                            break;
                        default:
                            return;
                    }
                }
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-notrunning", "Moderator"));
            }
        }
    }
});

$.on('ircChannelMessage', function(event) {
    var sender = event.getSender();
    var message = event.getMessage();
    
    if ($.raffleRunning == 1) {
        switch ($.enterRaffle(sender, message)) {
            case 0:
                return;
                break;
            case 1:
                if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-success"));
                break;
            case 2:
                return;
                break;
            case 3:
                if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-entered"));
                break;
            case 4:
                if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-notenough", $.inidb.get('settings', 'pointNameMultiple')));
                break;
            case 5:
                if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-iscaster"));
                break;
            case 6:
                if ($.raffleToggle == "true") $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.rafflesystem.enter-error-nofollow"));
                break;
            default:
                return;
        }
    } else {
        return;
    }
});

    if ($.moduleEnabled('./systems/raffleSystem.js')) {
        $.registerChatCommand("./systems/raffleSystem.js", "raffle");
    }
