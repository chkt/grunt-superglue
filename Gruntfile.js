module.exports = function(grunt) {
	grunt.initConfig({
		jshint : {
			all : {
				src : [
					'Gruntfile.js',
					'tasks/**/*.js',
					'<%= nodeunit.all.src %>'
				],
				
				options : {
					jshintrc : '.jshintrc'
				}
			}
		},
		
		superglue : {
			defaults : {
				files : {
					'tmp/defaults' : ['test/source/file1', 'test/source/file2']
				}
			},
			
			single : {
				options : {
					initTask : function(data) {
						data['initTask'] = '0';
						data['initDest'] = '0';
						data['endDest']  = '0';
						data['endTask']  = '0';
						data['object'] = [0];
					},
					initDest : function(data, dest) {
						data['initDest'] = '1';
						data['endDest']  = '1';
						data['initSource'] = '';
						data['concat'] = '';
						data['object'].push(1);
					},
					initSrc : function(data, dest, index, source, content) {
						data['initSource'] += (2 + index).toString();
						data['object'].push(2 + index);
						
						data['lastSource'] = 2 + index;
					},
					concat : function(data, dest, index, source, content) {
						var n = data['lastSource'] + 1;
						
						data['concat'] += (n + index).toString();
						data['object'].push(n + index);
						
						data['lastConcat'] = n + index;
					},
					write : function(data, dest, content) {
						var n = data['lastConcat'] + 1;
						
						var first = 
							data['initTask'].toString() + 
							data['initDest'].toString() + 
							data['initSource'].toString() + 
							data['concat'].toString() + 
							n.toString();
						var second = data['object'].join('') + n;
						
						return first + "\n" + second;
					},
					endDest : function(data, dest) {
						
					},
					endTask : function(data) {
						
					}
				},
				
				files : {
					'tmp/single' : ['test/source/file1', 'test/source/file2']
				}
			}
		},
		
		nodeunit : {
			all : {
				src : ['test/test*.js']
			}
		},
		
		clean : {
			all : {
				src : ['tmp']
			}
		}
	});
	
	grunt.loadTasks("tasks");
	
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-clean");
	
	grunt.registerTask('test', ['clean:all', 'superglue', 'nodeunit:all']);
	grunt.registerTask('default', ['jshint:all', 'test']);
};