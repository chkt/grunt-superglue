"use strict";

var _chalk = require('chalk');



function _buildMsg(task, step, message) {
	return task + "@" + step + ": " + message;
}



module.exports = function(grunt) {
	
	grunt.registerMultiTask('superglue', 'Multistep file processing.', function() {		
		var _global = {};
		var _target = {};
		
		var _options = this.options({
			initTask : function(data) {},
			initDest : function(data, dest) {},
			initSrc  : function(data, dest, index, name, string) { return string; },
			concat   : function(data, dest, index, name, string) { return string; },
			write    : function(data, dest, string) { return string; },
			endDest  : function(data, dest) {},
			endTask  : function(data) {}
		});
				
		if (typeof _options.initTask === 'function') {
			try {
				var ret = _options.initTask(_global);
			}
			catch (err) {
				grunt.log.error(_buildMsg(this.name, "initTask", err.message));

				return false;
			}

			if (ret === false) {
				grunt.log.writeln(_buildMsg(this.name, "initTask", _chalk.yellow("aborted")));
				
				return true;
			}
		}
		
		for (var i = 0, file = this.files[0]; file !== undefined; file = this.files[++i]) {
			var dest    = file.dest;
			var context = Object.create(_global);
			
			var target = {
				name    : dest,
				process : true,
				context : context,
				source  : [],
				string  : ""
			};
			
			if (typeof _options.initDest === 'function') {
				try {
					target.process = _options.initDest(context, dest) !== false;
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "initDest", err.message));
					
					return false;
				}
			}
			
			if (!target.process) {
				grunt.log.writeln(_buildMsg(this.name, "initDest", _chalk.yellow("aborted") + " " + _chalk.cyan(target.dest)));
				
				continue;
			}
			
			for (var j = 0, path = file.src[0]; path !== undefined; path = file.src[++j]) {
				if (!grunt.file.exists(path)) {
					grunt.log.warn(_buildMsg(this.name, "initSrc", _chalk.cyan(path) + " " + _chalk.yellow("missing")));
					
					continue;
				}
				
				var source = {
					index  : j,
					name   : path,
					string : grunt.file.read(path)
				};
				
				if (typeof _options.initSrc === 'function') {
					try {
						var ret = _options.initSrc(target.context, target.name, source.index, source.name, source.string);
					}
					catch (err) {
						grunt.log.error(_buildMsg(this.name, "initSrc", err.message));
						
						return false;
					}
					
					if (ret !== undefined) source.string = String(ret);
				}
				
				target.source.push(source);
			}
			
			if (target.source.length === 0) {
				grunt.log.warn(_buildMsg(this.name, "initSrc", _chalk.cyan(target.dest) + " " + _chalk.yellow("skipped")));
				
				target.process = false;
			}
			
			_target[dest] = target;
		}
		
		for (var dest in _target) {
			var target = _target[dest];
			
			if (!target.process) continue;
			
			for (var i = 0, source = target.source[0]; source !== undefined; source = target.source[++i]) {
				if (typeof _options.concat === 'function') {
					try {
						var ret = _options.concat(target.context, target.name, source.index, source.name, source.string);
					}
					catch (err) {
						grunt.log.error(_buildMsg(this.name, "concat", err.message));
						
						return false;
					}

					if (ret !== undefined) target.string += String(ret);
				}
				else target.string += source.string;
			}
			
			if (typeof _options.write === 'function') {
				try {
					ret = _options.write(target.context, target.name, target.string);
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "write", err.message));
					
					return false;
				}
				
				if (ret !== undefined) target.string = String(ret);
			}
			
			if (target.string === "") {
				grunt.log.warn(_buildMsg(this.name, "write", _chalk.cyan(target.name) + " " + _chalk.yellow("skipped")));
				
				continue;
			}
			
			grunt.file.write(target.name, target.string);
			
			grunt.log.writeln(_buildMsg(this.name, "write", _chalk.cyan(target.name) + "..." + _chalk.green("OK")));
			
			if (typeof _options.endDest === 'function') {
				try {
					_options.endDest(target.context, target.name);
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "endDest", err.message));
					
					return false;
				}
			}
		}
				
		if (typeof _options.endTask === 'function') {
			try {
				_options.endTask(_global);
			}
			catch (err) {
				grunt.log.error(_buildMsg(this.name, "endTask", err.message));
				
				return false;
			}
		}
		
		return true;
	});
};