/* custom grunt file made by Rogliano Antoine
great compatibility with RequireJS */
module.exports = function(grunt)
{
  'use strict';
  
  grunt.initConfig(
  {
    pkg: grunt.file.readJSON('package.json') // TODO - not used yet, improve header making with grunt
    
    , clean: {
      assets: [ 'release/img/*', 'release/audio/*' ]
    }
    
    , requirejs: { // requirejs compil
      game: {
        options: {
          findNestedDependencies: true
          , mainConfigFile: '_dev/js/files.js'
          , baseUrl : '_dev/js/'
          , name : 'main'
          , out : 'release/temp/game.js'
          , preserveLicenseComments: false
          , optimize : 'uglify' // uglify or none
          , uglify: {
            toplevel: true
            , ascii_only: true
            , beautify: true
            , max_line_length: 1000
          }
          , closure: {
            CompilerOptions: {}
            ,CompilationLevel: 'SIMPLE_OPTIMIZATIONS'
            ,loggingLevel: 'WARNING'
            ,preserveLicenseComments: false
          }
          , inlineText: true
          , useStrict: false
        }
      }
      , solo: {
        options: {
          findNestedDependencies: true
          , mainConfigFile: '_version_solo/js/files.js'
          , baseUrl : '_version_solo/js/'
          , name : 'main'
          , out : 'release/v_solo/game.js'
          , preserveLicenseComments: false
          , optimize : 'uglify' // uglify or none
          , uglify: {
            toplevel: true
            , ascii_only: true
            , beautify: true
            , max_line_length: 1000
          }
          , closure: {
            CompilerOptions: {}
            ,CompilationLevel: 'SIMPLE_OPTIMIZATIONS'
            ,loggingLevel: 'WARNING'
            ,preserveLicenseComments: false
          }
          , inlineText: true
          , useStrict: false
        }
      }
    }
    
    // create concat foreach platform
    , concat: {
      web: {
        src: [
          'HEADER.txt',
          'release/temp/game.js'
        ],
        dest: 'release/web/game.js'
      }
      , css: {
        src: [
          '_dev/css/bootstrap.css'
          ,'_dev/css/minified-style.css'
        ],
        dest: '_dev/style.css'
      }
      
      , solo_web: {
        src: [
          'HEADER.txt',
          'release/v_solo/game.js'
        ],
        dest: 'release/_v_solo/game.js'
      }
      , solo_css: {
        src: [
          '_version_solo/css/bootstrap.css'
          ,'_version_solo/css/minified-style.css'
        ],
        dest: '_version_solo/style.css'
      }
    }
    
    // move prod files to prod dir
    , copy: { // copy something in given dest
      assets: {
        expand: true,
        flatten: false,
        cwd: '_dev',
        src: [ 'audio/**/*', 'img/**/*', "style.css" ],
        dest: 'release/_common/'
      }
      , require: {
        expand: true,
        flatten: true,
        src: [ '_dev/js/ext_libs/require.js' ],
        dest: 'release/_common/'
      }
    }
    
    , less: {
      game: {
        options: { compress: true },
        files: {
          '_dev/css/minified-style.css': '_dev/less/config.less'
        }
      }
      
      , solo: {
        options: { compress: true },
        files: {
          '_version_solo/css/minified-style.css': '_version_solo/less/config.less'
        }
      }
    }
    
    , watch: {
      all: {
        files: [
          '_dev/less/**/*.less'
          , '_dev/js/**/*.js'
        ]
        , tasks: ['default']
      }
      
      , css: {
        files: [ '_dev/less/**/*.less' ]
        , tasks: ['css']
      }
      
      , solo_css: {
        files: [ '_version_solo/less/**/*.less' ]
        , tasks: ['solo-css']
      }
      
      , js: {
        files: [ '_dev/js/**/*.js' ]
        , tasks: ['web']
      }
    }
  } );
  
  // Load tasks from "grunt-sample" grunt plugin installed via Npm.
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  // Default task.
  grunt.registerTask( 'default', [ 'assets', 'web' ] );
  grunt.registerTask( 'assets', [ 'clean:assets', 'copy' ] );
  grunt.registerTask( 'css', [ 'less:game', 'concat:css' ] );
  grunt.registerTask( 'solo-css', [ 'less:solo', 'concat:solo_css' ] );
  grunt.registerTask( 'web', [ 'requirejs:game', 'concat:web' ] );
  grunt.registerTask( 'web-solo', [ 'requirejs:solo', 'concat:solo_web' ] );
};