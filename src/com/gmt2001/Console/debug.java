/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gmt2001.Console;

import com.gmt2001.Logger;
import java.lang.StackTraceElement;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import me.gloriouseggroll.quorrabot.Quorrabot;

public class debug {

    private static final debug instance = new debug();

    public static debug instance() {
        return instance;
    }
    
    private debug() {
    }

    private debug(Object o) {
        if (Quorrabot.enableDebugging) {
            String stackInfo = "";
            String fullClassName = Thread.currentThread().getStackTrace()[2].getClassName();
            String className = fullClassName.substring(fullClassName.lastIndexOf(".") + 1);
            String methodName = Thread.currentThread().getStackTrace()[2].getMethodName();
            String fileName = Thread.currentThread().getStackTrace()[2].getFileName();
            int lineNumber = Thread.currentThread().getStackTrace()[2].getLineNumber();

            stackInfo = "[" +  methodName + "()@" + fileName + ":" + lineNumber + "] ";

            Logger.instance().log(Logger.LogType.Debug, logTimestamp.log() + " " + stackInfo + o.toString());
            Logger.instance().log(Logger.LogType.Debug, "");
            System.out.println("[" + logTimestamp.log() + "] [DEBUG] " + stackInfo + o);
        }
    }

    public static void println() {
      if (Quorrabot.enableDebugging) {
        System.out.println();
      }
    }

    public static void printlnRhino(Object o) {
        if (Quorrabot.enableDebugging) {
            Logger.instance().log(Logger.LogType.Debug, logTimestamp.log() + " " + o.toString());
            Logger.instance().log(Logger.LogType.Debug, "");
            System.out.println("[" + logTimestamp.log() + "] [DEBUG] " + o);
        }
    }

    public static void println(Object o) {
        if (Quorrabot.enableDebugging) {
            String stackInfo = "";
            String fullClassName = Thread.currentThread().getStackTrace()[2].getClassName();
            String className = fullClassName.substring(fullClassName.lastIndexOf(".") + 1);
            String methodName = Thread.currentThread().getStackTrace()[2].getMethodName();
            String fileName = Thread.currentThread().getStackTrace()[2].getFileName();
            int lineNumber = Thread.currentThread().getStackTrace()[2].getLineNumber();

            Logger.instance().log(Logger.LogType.Debug, logTimestamp.log() + " " + stackInfo + o.toString());
            Logger.instance().log(Logger.LogType.Debug, "");

            stackInfo = "[" +  methodName + "()@" + fileName + ":" + lineNumber + "] ";
            System.out.println("[" + logTimestamp.log() + "] [DEBUG] " + stackInfo + o);
        }
    }

    public static void printStackTrace(Throwable e) {
        if (Quorrabot.enableDebugging) {
            e.printStackTrace(System.err);
            logStackTrace(e);
        }
    }

    public static void logStackTrace(Throwable e) {
        if (Quorrabot.enableDebugging) {
            Writer trace = new StringWriter();
            PrintWriter ptrace = new PrintWriter(trace);
    
            e.printStackTrace(ptrace);
    
            Logger.instance().log(Logger.LogType.Debug, logTimestamp.log() + " " + trace.toString());
            Logger.instance().log(Logger.LogType.Debug, "");
        }
    }
}