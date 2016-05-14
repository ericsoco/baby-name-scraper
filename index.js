var request = require('request'),
	cheerio = require('cheerio'),
	json2csv = require('json2csv'),
	fs = require('fs');

var csvDest = './csv';

var url = 'https://www.ssa.gov/cgi-bin/popularnames.cgi',
	numTopNames = 1000,
	startYear = 1880,
	endYear = new Date().getFullYear() - 1;
	reqParams = {
		'number': 'p',
		'top': numTopNames
	};

function fetchRow (year, cb) {

	var formData = Object.assign({}, reqParams, {
		year: year
	});

	request.post(
		{
			url: url,
			form: formData
		},

		function (error, response, body) {

			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body),
					rows = $('table').eq(1).find('[align="right"]');

				var names = rows.toArray().reduce(function (names, row, i) {
					names = names.concat(parseRow(year, row, $));
					return names;
				}, []);

				writeNamesToFile(year, names, cb);

			} else {
				console.error(error);
			}

		}
	);

}

function parseRow (year, row, $) {

	var cells = $(row).find('td').toArray();
	return [
		{
			year: year,
			name: $(cells[1]).text(),
			fraction: parseFloat(($(cells[2]).text().replace('%', '') / 100).toFixed(6)),
			sex: 'm'
		},
		{
			year: year,
			name: $(cells[3]).text(),
			fraction: parseFloat(($(cells[4]).text().replace('%', '') / 100).toFixed(6)),
			sex: 'f'
		}
	];

}

function writeNamesToFile (filename, names, cb) {

	if (!fs.existsSync(csvDest)) {
		fs.mkdirSync(csvDest);
	}

	json2csv(
		{
			data: names,
			quotes: ''
		},

		function (error, csv) {

			if (!error) {
				var path = csvDest + '/' + filename + '.csv';
				fs.writeFile(path, csv, 'utf8', function (writeError) {
					if (writeError) {
						throw writeError;
					} else {
						console.log('saved ' + path);
					}
					cb();
				})
			} else {
				console.error(error);
			}

		}
	);

}

function scrapeNames () {

	var numYearsToScrape = endYear - startYear + 1,
		concatPath = csvDest + '/all.csv';

	for (var year=startYear; year<=endYear; year++) {
		fetchRow(year, onYearScraped);
	}

	function onYearScraped () {

		if (!--numYearsToScrape) {
			console.log("Scraped all years. Concatenating...");

			// delete any previously concatenated results
			try {
				fs.accessSync(concatPath, fs.F_OK);
				fs.unlink(concatPath);
			} catch (e) {}

			// manually iterate and concatenate in order to skip csv headers
			for (var i=startYear; i<=endYear; i++) {
				var file = fs.readFileSync(csvDest + '/' + i + '.csv', 'utf8');
				if (i > startYear) {
					file = '\n' + file.split('\n').slice(1).join('\n');
				}
				fs.appendFileSync(concatPath, file)
			}

			console.log('Concatenated to ' + concatPath);
		}

	}

}

scrapeNames();
