#!/usr/bin/env node --no-warnings
/*
 * Copyright © 2019, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const restaf  = require('@sassoftware/restaf');
const vorpal  = require('vorpal')();
const config  = require('./src/config');
const logon   = require('./src/logon');
const runCmds = require('./src/runCmds');
const upload = require('./src/upload');
const tableImport = require('./src/tableImport');
const reportImport = require('./src/reportImport');
const reportExport = require('./src/reportExport');
const caslibList = require('./src/caslibList');
const reportList = require('./src/reportList');
const tablesList = require('./src/tablesList');

const fs = require('fs');

let servers = null;
let argv = require('yargs').argv;
let cmdFile = argv.file == null ? null : argv.file;
let envFile = argv.env == null ? null : argv.env;
console.log(cmdFile);
console.log(envFile);


// setup handling of https
/*
let initOpts = { pem: null, rejectUnathorized: 1 };
if (process.env.PEMFILE != null) {
	console.log(`pem file set to: ${process.env.PEMFILE}`);
	let pem =
		process.env.pemFile != null
			? fs.readFileSync(process.env.pemFile, 'utf8')
			: null;
	initOpts = { pem: pem, rejectUnauthorized: 0 };
}
*/

let store = restaf.initStore();
let payload = config(envFile);

runCli(store, cmdFile);

function runCli (store, cmdFile) {
	vorpal
		.command('logon')
		.description('Logon to Viya')
		.action((args, cb) => {
			vorpal.activeCommand.prompt(
				{
					type   : 'input',
					name   : 'user',
					message: 'Enter your userid> '
				},
				result => {
					payload.user = result.user;
					vorpal.activeCommand.prompt(
						{
							type   : 'password',
							name   : 'password',
							message: 'Enter your password> '
						},
						result => {
							payload.password = result.password;
							logon(store, payload)
								.then(r => {
									servers = r.servers;
									vorpal.log('Logon Successful');
									cb();
								})
								.catch(err => {
									vorpal.log(err);
									cb();
								});
						}
					);
				}
			);
		});

	vorpal
		.command(
			'upload',
			'Upload resources (data, code and astore)to cas tables')
		.hidden()
		.description('upload code, data or astore to sashdat')
		.validate(args => {
			if (args.options.file == null || args.options.output == null) {
				return 'Both file and output must be specified';
			}
			return true;
		})
		.option(
			'-f --file <file>',
			'Currently supported extensions: sas, ds2, casl, sashdat, sasb7dat, astore , sasast, csv'
		)
		.option(
			'-o --output <output>',
			'output castable(caslib.name)- name will be upper-cased'
		)

		.action((args, callback) => {
			upload(store, servers, args, vorpal)
				.then(r => {
					vorpal.log(r);
					callback();
				})
				.catch(err => {
					vorpal.log(err);
					callback();
				});
		});
	
	

	vorpal
		.command('tables import <dir> [files...]', 'import .sas, .ds2, .sashdat, .sasb7dat, .astore , .sasast, .csv')
		.description('Import .sas, .ds2, .sashdat, .sasb7dat, .astore , .sasast, .csv into CAS Tables')
		.validate((args) => {

			let options = args.options;
			if (options.caslib == null) {
				return 'Target caslib must be specified';
			}
			return true;
		})
		// .option('-d --dir <dir>', 'input directory')
		.option('-c --caslib <caslib>', 'target caslib')

		.action((args, callback) => {
			tableImport(store,servers, args, vorpal)
				.then((r) => {
					vorpal.log(r);
					callback();
				})
				.catch((err) => {
					vorpal.log(err);
					callback();
				});
		});
	
	

	vorpal
		.command('reports list', 'List all reports')
		.description('List all the VA reports')
		.action((args, callback) => {
			reportList(store, vorpal)
				.then(r => callback())
				.catch(err => {
					vorpal.log(err);
					callback();
				});
		});
	
	vorpal
		.command('reports import <dir> [files...]', 'import VA reports')
		.description('Import VA reports')
		.validate((args) => {
			let options = args.options;
			if (options.folder == null && options.uri == null) {
				return('Specify either folder or uri');
			}
			return true;
		})
		// .option('-d --dir <dir>','input directory')
		.option('-f --folder <folder>', 'name of output folder(ex: Public)')
		.option('-u --uri <uri>', 'specify parentUri in place of folder name')

		.action((args, callback) => {
			reportImport(store, args, vorpal)
				.then((r) => {
					vorpal.log(r);
					callback();
				})
				.catch((err) => {
					vorpal.log(err);
					callback();
				});
		});
	vorpal
		.command('reports export [files...]', 'Export report')
		.description('Export VA reports')
		.validate((args) => {
			if (args.options.dir == null) {
				vorpal.log('Destination directory must be specified');
				return false;
			}
			return true;
		})
		.option('-d --dir <dir>', 'destination path(without filename')

		.action((args, callback) => {
			reportExport(store, args, vorpal)
				.then((r) => {
					vorpal.log(r);
					callback();
				})
				.catch((err) => {
					vorpal.log(err);
					callback();
				});
		});

	vorpal
		.command('file <cmdfile>', 'Command file to execute')
		.description('Process the commands in the specified file')
		.action((args, callback) => {
			runCmds(store, args.cmdfile, vorpal)
				.then(r => {
					vorpal.log(r);
					callback();
				})
				.catch(err => {
					vorpal.log(err);
					callback();
				});
		});
	
	vorpal
		.command('caslibs', 'List all caslibs')
		.description('List all active caslibs')
		.action((args, callback) => {
			caslibList(store, servers, vorpal)
				.then(() => {
					callback();
				})
				.catch((err) => {
					vorpal.log(err);
					callback();
				});

		});
	
	vorpal
		.command('tables list <caslib> ', 'List tables in a caslib')
		.description('List tables in a specified caslib')
		.action((args, callback) => {
			tablesList(store, servers, args, vorpal)
				.then(() => {
					callback();
				})
				.catch((err) => {
					vorpal.log(err);
					callback();
				});
		});
	
	vorpal
		.delimiter('>> ')
		.log('Welcome to viyacaddy')
		.log('Enter help to get a list of all the commands')
		.log('Use logon command to start your SAS Viya session')
		.log('');

	if (cmdFile === null) {
		vorpal.show();
	} else {
		logon(store, payload)
			.then(r => {
				servers = r.servers;
				vorpal.log(`command file: ${cmdFile}`);
				return runCmds(store, cmdFile, vorpal);
			})
			.then(r => console.log(r))
			.catch(err => {
				vorpal.log(JSON.stringify(err,null,4));
			});
	}
}
