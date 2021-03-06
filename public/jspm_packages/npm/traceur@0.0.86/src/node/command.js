/* */ 
(function(process) {
  'use strict';
  var path = require("path");
  var glob = require("glob");
  var commandLine;
  var cmdName = path.basename(process.argv[1]);
  try {
    commandLine = new (require("commander").Command)(cmdName);
  } catch (ex) {
    console.error('Commander.js is required for this to work. To install it ' + 'run:\n\n  npm install commander\n');
    process.exit(1);
  }
  commandLine.setMaxListeners(100);
  var traceurAPI = require("./api");
  var interpret = require("./interpreter");
  require("./System");
  var rootSources = [];
  commandLine.option('--script <fileName>', 'Parse as Script', function(fileName) {
    rootSources.push({
      name: fileName,
      type: 'script'
    });
  });
  commandLine.option('--module <fileName>', 'Parse as Module', function(fileName) {
    rootSources.push({
      name: fileName,
      type: 'module'
    });
  });
  commandLine.option('--inline <fileName>', 'Parse as Module, format \'inline\'', function(fileName) {
    rootSources.push({
      name: fileName,
      type: 'module',
      format: 'inline'
    });
  });
  commandLine.option('--out <FILE>', 'Compile all input files into a single file');
  commandLine.option('--dir <INDIR> <OUTDIR>', 'Compile an input directory of modules into an output directory');
  commandLine.option('--longhelp', 'Show all known options');
  commandLine.on('longhelp', function() {
    commandLine.help();
    process.exit();
  });
  var shouldExit = false;
  function processExit() {
    shouldExit = true;
    var draining = 0;
    function exit() {
      if (!draining--)
        process.exit();
    }
    if (process.stdout.bufferSize) {
      draining += 1;
      process.stdout.once('drain', exit);
    }
    if (process.stderr.bufferSize) {
      draining += 1;
      process.stderr.once('drain', exit);
    }
    exit();
  }
  commandLine.option('-v, --version', 'Show version and exit');
  commandLine.on('version', function() {
    process.stdout.write(System.version.split('@')[1]);
    processExit();
  });
  commandLine.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ %s a.js [args]', cmdName);
    console.log('    $ %s --out compiled.js b.js c.js', cmdName);
    console.log('    $ %s --dir indir outdir', cmdName);
    console.log('');
  });
  var commandOptions = new traceurAPI.util.CommandOptions();
  traceurAPI.util.addOptions(commandLine, commandOptions);
  commandLine.usage('[options] [files]');
  commandLine.command('*').action(function() {
    for (var i = 0; i < arguments.length - 1; i++) {
      rootSources.push({
        name: arguments[i],
        type: 'module'
      });
    }
  });
  commandLine.sourceMaps = false;
  commandLine.parse(process.argv);
  commandOptions.sourceMaps = commandLine.sourceMaps;
  if (!shouldExit && !rootSources.length) {
    console.error('\n  Error: At least one input file is needed');
    commandLine.help();
    process.exit(1);
  }
  var out = commandLine.out;
  var dir = commandLine.dir;
  function compileAll(out, sources, options) {
    var isSingleFileCompile = /\.js$/.test(out);
    if (!isSingleFileCompile) {
      traceurAPI.forEachRecursiveModuleCompile(out, sources, options);
    } else {
      traceurAPI.recursiveModuleCompileToSingleFile(out, sources, options).then(function() {
        process.exit(0);
      }).catch(function(err) {
        var errors = err.errors || [err];
        errors.forEach(function(err) {
          console.error(err.stack || err);
        });
        process.exit(1);
      });
    }
  }
  function globSources(sourcesToGlob, cb) {
    var processedCount = 0;
    var globbedSources = [];
    sourcesToGlob.forEach(function(item) {
      glob(item.name, {}, function(err, matches) {
        if (err)
          throw new Error('While scanning ' + item.name + ': ' + err);
        for (var i = matches.length - 1; i >= 0; i--) {
          var globbedSource = {
            name: matches[i],
            type: item.type,
            format: item.format
          };
          globbedSources.push(globbedSource);
        }
        processedCount++;
        if (processedCount === sourcesToGlob.length) {
          cb(null, globbedSources);
        }
      });
    });
  }
  if (!shouldExit) {
    if (out) {
      var sourcesToGlob = [];
      var processedSources = [];
      for (var i = 0; i < rootSources.length; i++) {
        if (glob.hasMagic(rootSources[i].name)) {
          sourcesToGlob.push(rootSources[i]);
        } else {
          processedSources.push(rootSources[i]);
        }
      }
      if (!sourcesToGlob.length) {
        compileAll(out, processedSources, commandOptions);
      } else {
        globSources(sourcesToGlob, function(err, globbedSources) {
          processedSources.push.apply(processedSources, globbedSources);
          if (processedSources.length) {
            compileAll(out, processedSources, commandOptions);
          } else {
            process.exit(0);
          }
        });
      }
    } else if (dir) {
      if (rootSources.length !== 1)
        throw new Error('Compile all in directory requires exactly one input filename');
      traceurAPI.compileAllJsFilesInDir(dir, rootSources[0].name, commandOptions);
    } else {
      rootSources.forEach(function(obj) {
        interpret(path.resolve(obj.name), commandOptions);
      });
    }
  }
})(require("process"));
