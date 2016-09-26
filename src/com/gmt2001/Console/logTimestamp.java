/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Thomas
 */
package com.gmt2001.Console;

import com.gmt2001.Logger;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import me.gloriouseggroll.quorrabot.Quorrabot;

public class logTimestamp {
    public static String log() {
        SimpleDateFormat datefmt = new SimpleDateFormat("MM-dd-yyyy @ HH:mm:ss.SSS z");
        datefmt.setTimeZone(TimeZone.getTimeZone(Quorrabot.instance().timeZone));
        return datefmt.format(new Date());
    }
}