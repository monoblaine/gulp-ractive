var fs = require('fs');
var through = require('through2');
var gulputil = require('gulp-util');
var Ractive = require('ractive');
var PluginError = gulputil.PluginError;

const PLUGIN_NAME = 'gulp-ractive';

function gulpRactive(options, cfg)
{
    cfg = cfg || {};

	var stream = through.obj(function(file, enc, callback) {
		if (file.isStream())
		{
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return callback();
		}

		var filecontents = "";

		try {
			filecontents = String(file.contents).replace(/\r?\n\s*/g, "");

            var prefix = '';

            if (cfg.asJsVar === true) {
                var templateName = filecontents.match(/\{\{!# +([^}]+)\}\}/).pop();

                prefix = ';Ractive.templates.' + templateName + '=';
            }

			//Parse template in Ractive
			filecontents = Ractive.parse(filecontents, options);
			filecontents = JSON.stringify(filecontents);

            if (cfg.asJsVar === true) {
                filecontents = prefix + filecontents + ';';
            }

			file.contents = new Buffer(filecontents);
			this.push(file);
		}
		catch (e) {
			console.warn('Error caught from Ractive.parse: ' +
				e.message + ' in ' + file.path + '. Returning uncompiled template');
			this.push(file);
			return callback();
		}

		callback();
	});

	return stream;
}

module.exports = gulpRactive;
