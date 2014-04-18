"use strict";

var grunt = require('grunt');

exports.superglue = {
	defaults : function(test) {
		test.expect(1);
		
		var wants = grunt.util.normalizelf(grunt.file.read('test/result/defaults'));
		var has   = grunt.util.normalizelf(grunt.file.read('tmp/defaults'));
		
		test.equal(wants, has, 'concat two files using defaults');
		test.done();
	},
	
	single : function(test) {
		test.expect(1);
		
		var wants = grunt.util.normalizelf(grunt.file.read('test/result/single'));
		var has   = grunt.util.normalizelf(grunt.file.read('tmp/single'));
		
		test.equal(wants, has, 'create output from data property');
		test.done();
	}
};