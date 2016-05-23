/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.gamewisp;

import me.gloriouseggroll.quorrabot.jerklib.Channel;
/**
 *
 * @author Tom
 */
public class GameWispAnniversaryEvent extends GameWispEvent {

    private final String username;
    private final int months;

    public GameWispAnniversaryEvent(String username, int months) {
        this.username = username;
        this.months = months;
    }

    public GameWispAnniversaryEvent(String username, int months, Channel channel) {
        super(channel);
        this.username = username;
        this.months = months;
    }

    public String getUsername() {
        return username;
    }

    public int getMonths() {
        return months;
    }
}
