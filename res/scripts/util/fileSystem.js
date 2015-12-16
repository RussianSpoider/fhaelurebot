$.readFile = function(path) {
    var lines = [];
    
    try {
        var fis = new java.io.FileInputStream (path);
        var scan = new java.util.Scanner (fis);
        for (var i = 0; scan.hasNextLine (); ++i) {
            lines [i] = scan.nextLine ();
        }
        fis.close ();
    } catch (e) {
        println ("Failed to open '" + path + "': " + e);
    }
    
    return lines;
}

$.mkDir = function(path) {
    var dir = new java.io.File(path);
    dir.mkdir();
}

$.moveFile = function(file,path) {
    var file = new java.io.File(file);
    var path = new java.io.File(path);
    if((file!=null && path!=null)|| (file!="" && path!=""))
    {
        org.apache.commons.io.FileUtils.moveFileToDirectory(file, path, true);
    }
}

$.saveArray = function(array, path, append) {
    try {
        var fos = new java.io.FileOutputStream (path, append);
        var ps = new java.io.PrintStream (fos);
        var l=array.length;
        for (var i=0; i<l; ++i) {
            ps.println (array [i]);
        }
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "': " + e);
    }
}

$.writeToFile = function(string, path, append) {
    try {
        var fos = new java.io.FileOutputStream (path, append);
        var ps = new java.io.PrintStream (fos);
        ps.println (string);
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "': " + e);
    }
}

$.touchFile = function(path) {
    try {
        var fos = new java.io.FileOutputStream(path, true);
        fos.close ();
    } catch (e) {
        println ("Failed to touch '" + path + "': " + e);
    }
}

$.deleteFile = function(path, now) {
    try {
        var f = new java.io.File(path);
        
        if (now) {
            f['delete']();
        } else {
            f.deleteOnExit();
        }
    } catch (e) {
        println("Failed to delete '" + path + "': " + e)
    }
}

$.fileExists = function(path) {
    try {
        var f = new java.io.File(path);
        return f.exists();
    } catch (e) {
        return false;
    }
    
    return false;
}

$.findFiles = function(directory, pattern) {
    try {
        var f = new java.io.File(directory);
        
        var ret = new Array();
        
        if (!f.isDirectory()) {
            throw "not a valid directory";
        } else {
            var files = f.list();
            
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf(pattern) != -1) {
                    ret.push(files[i]);
                }
            }
            
            return ret;
        }
    } catch (e) {
        println("Failed to search in '" + directory + "': " + e)
    }
    
    return new Array();
}

$.isDirectory = function(path) {
    try {
        var f = new java.io.File(path);
        return f.isDirectory();
    } catch (e) {
        return false;
    }
    
    return false;
}

$.findSize = function(file) {
    var file = new java.io.File(file); 
    return file.length();
}

var fileHooks = new Array();
$.fileHook = new Array();

$.fileHook.getHookIndex = function (scriptFile, file) {
    for (var key in fileHooks) {
        if (fileHooks[key][0].equalsIgnoreCase(scriptFile) && fileHooks[key][1].equalsIgnoreCase(file)) {
            return key;
        }
    }
    return -1;
}

$.fileHook.hasHook = function (scriptFile, file) {
    return $.fileHook.getHookIndex(scriptFile, file) != -1;
}

$.fileHook.add = function (file, content, handler) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i = $.fileHook.getHookIndex(scriptFile, file);

    if (i == -1) {
        fileHooks.push(new Array(scriptFile, file, null));
        i = $.fileHook.getHookIndex(scriptFile, file);
    }

    fileHooks[i][2] = handler;
    fileHooks[i][3] = $.findSize(file);
    fileHooks[i][4] = content;
}

$.onFile = $.fileHook.add;

$.fileHook.remove = function (file) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i = $.fileHook.getHookIndex(scriptFile, file);

    if (i != -1) {
    	fileHooks.splice(i, 1);
    }
}

$.fileHook.call = function (file, arg) {
    for (var key in fileHooks) {
        if (fileHooks[key][1].equalsIgnoreCase(file) && $.moduleEnabled(fileHooks[key][0]) && $.fileExists(fileHooks[key][1])) {
			fileHooks[key][3] = $.findSize(fileHooks[key][1]);
			fileHooks[key][4] = $.readFile(fileHooks[key][1]).toString();
        	fileHooks[key][2](arg);
        }
    }
}

$.timer.addTimer("./util/fileSystem.js", "fileWatcher", true, function() {
	for (var key in fileHooks) {
		if ($.moduleEnabled(fileHooks[key][0]) && $.fileExists(fileHooks[key][1]) && (fileHooks[key][3] != $.findSize(fileHooks[key][1]) || fileHooks[key][4] != $.readFile(fileHooks[key][1]).toString())) {
			fileHooks[key][3] = $.findSize(fileHooks[key][1]);
			fileHooks[key][4] = $.readFile(fileHooks[key][1]).toString();
			fileHooks[key][2](fileHooks[key][4]);
		}
	}
}, 10 * 1000);
