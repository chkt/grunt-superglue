"use strict";

var _URI   = require('./lib/uri.cjs.min.js');
var _chalk = require('chalk');



function _buildMsg(task, step, message) {
	return task + "@" + step + ": " + message;
}



module.exports = function(grunt) {
	grunt.registerMultiTask('superglue', 'Multistep file processing.', function() {		
		var _global = {};
		var _target = {};
		
		var _options = this.options({
			/**
			 * Stage 0: Initializes the task context
			 * Called once per task
			 * Aborts the task when returning false
			 * Aborts the task when throwing
			 * @name openTask
			 * @callback
			 * @param {Object} data The task context
			 * @returns {undefined|false}
			 */
			
			/**
			 * Stage 1: Initializes the destination context
			 * Called once per destination
			 * Aborts the destination when returning false
			 * Aborts the task when throwing
			 * @name openTarget
			 * @callback
			 * @param {Object}           data The destination context
			 * @param {URIPathComponent} dest The destination path
			 * @returns {undefined|false}
			 */
			
			/**
			 * Stage 2: Initializes a source
			 * Called once per source
			 * Replaces the source string when not returning undefined
			 * Aborts the task when throwing
			 * @name openSource
			 * @callback
			 * @param {Object}           data   The destination context
			 * @param {URIPathComponent} dest   The destination path
			 * @param {Uint}             index  The source order index
			 * @param {URIPathComponent} name   The source path
			 * @param {String}           string The source content
			 * @returns {undefined|String}
			 */

			/**
			 * Stage 3: Concatenates the target string
			 * Called once per source
			 * Replaces the source string when not returning undefined
			 * Aborts the task when throwing
			 * @name beforeConcat
			 * @callback
			 * @param {Object}           data   The destination context
			 * @param {URIPathComponent} dest   The destination path
			 * @param {Uint}             index  The source order index
			 * @param {URIPathComponent} name   The source path
			 * @param {String}           string The source context
			 * @returns {undefined|String}
			 */

			/**
			 * Stage 4: Writes the target string
			 * Called once per destination
			 * Replaces the target string when not returning undefined
			 * Aborts the task when throwing
			 * @name afterConcat
			 * @callback
			 * @param {Object}           data   The destination context
			 * @param {URIPathComponent} dest   The destination path
			 * @param {String}           string The destination string
			 * @returns {unresolved}
			 */

			/**
			 * Stage 5: Executes post-write tasks
			 * Called once per destination
			 * Aborts the task when throwing
			 * @name closeTarget
			 * @callback
			 * @param {Object}           data The destination context
			 * @param {URIPathComponent} dest The destination path
			 * @returns {undefined}
			 */

			/**
			 * Stage 6: Executes post-write tasks
			 * Called once per task
			 * Aborts the task when throwing
			 * @name closeTask
			 * @callback
			 * @param {Object} data The task context
			 * @returns {undefined}
			 */
		});
		
		/*
		 * Stage 0: openTask
		 */
		if (typeof _options.openTask === 'function') {
			try {
				var ret = _options.openTask(_global);
			}
			catch (err) {
				grunt.log.error(_buildMsg(this.name, "openTask", err.message));

				return false;
			}

			if (ret === false) {
				grunt.log.writeln(_buildMsg(this.name, "openTask", _chalk.yellow("aborted")));
				
				return true;
			}
		}
		
		for (var i = 0, file = this.files[0]; file !== undefined; file = this.files[++i]) {
			var dest    = _URI.URIPathComponent.ComponentString(file.dest);
			var context = Object.create(_global);
			
			var target = {
				name    : dest,
				process : true,
				context : context,
				source  : [],
				string  : ""
			};
			
			/*
			 * Stage 1: openTarget
			 */			
			if (typeof _options.openTarget === 'function') {
				try {
					target.process = _options.openTarget(context, dest) !== false;
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "openTarget", err.message));
					
					return false;
				}
			}
			
			if (!target.process) {
				grunt.log.writeln(_buildMsg(this.name, "openTarget", _chalk.yellow("aborted") + " " + _chalk.cyan(target.dest)));
				
				continue;
			}
			
			for (var j = 0, path = file.src[0]; path !== undefined; path = file.src[++j]) {
				if (!grunt.file.exists(path)) {
					grunt.log.warn(_buildMsg(this.name, "openSource", _chalk.cyan(path) + " " + _chalk.yellow("missing")));
					
					continue;
				}
				
				var source = {
					index  : j,
					name   : _URI.URIPathComponent.ComponentString(path),
					string : grunt.file.read(path)
				};
				
				/*
				 * Stage 2: openSource
				 */
				if (typeof _options.openSource === 'function') {
					try {
						var ret = _options.openSource(target.context, target.name, source.index, source.name, source.string);
					}
					catch (err) {
						grunt.log.error(_buildMsg(this.name, "openSource", err.message));
						
						return false;
					}
					
					if (ret !== undefined) source.string = String(ret);
				}
				
				target.source.push(source);
			}
			
			if (target.source.length === 0) {
				grunt.log.warn(_buildMsg(this.name, "openSource", _chalk.cyan(target.dest) + " " + _chalk.yellow("skipped")));
				
				target.process = false;
			}
			
			_target[dest] = target;
		}
		
		for (var dest in _target) {
			var target = _target[dest];
			
			if (!target.process) continue;
			
			for (var i = 0, source = target.source[0]; source !== undefined; source = target.source[++i]) {
				/*
				 * Stage 3: beforeConcat
				 */
				if (typeof _options.beforeConcat === 'function') {
					try {
						var ret = _options.beforeConcat(target.context, target.name, source.index, source.name, source.string);
					}
					catch (err) {
						grunt.log.error(_buildMsg(this.name, "beforeConcat", err.message));
						
						return false;
					}

					target.string += ret !== undefined ? String(ret) : source.string;
				}
				else target.string += source.string;
			}
			
			/*
			 * Stage 4: afterConcat
			 */
			if (typeof _options.afterConcat === 'function') {
				try {					
					ret = _options.afterConcat(target.context, target.name, target.string);
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "afterConcat", err.message));
					
					return false;
				}
				
				if (ret !== undefined) target.string = String(ret);
			}
			
			if (target.string === "") {
				grunt.log.warn(_buildMsg(this.name, "afterConcat", _chalk.cyan(target.name) + " " + _chalk.yellow("skipped")));
				
				continue;
			}
						
			grunt.file.write(target.name.toString(), target.string);
			
			grunt.log.writeln(_buildMsg(this.name, "afterConcat", _chalk.cyan(target.name) + "..." + _chalk.green("OK")));
			
			/*
			 * Stage 5: closeTarget
			 */
			if (typeof _options.closeTarget === 'function') {
				try {
					_options.closeTarget(target.context, target.name);
				}
				catch (err) {
					grunt.log.error(_buildMsg(this.name, "closeTarget", err.message));
					
					return false;
				}
			}
		}
		
		/*
		 * Stage 6: closeTask
		 */
		if (typeof _options.closeTask === 'function') {
			try {
				_options.closeTask(_global);
			}
			catch (err) {
				grunt.log.error(_buildMsg(this.name, "closeTask", err.message));
				
				return false;
			}
		}
		
		return true;
	});
};