/*
 * Copyright © 2019, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';
const fs = require('fs').promises;
const upload = require('./upload');

module.exports = async function tableImport (store, server, args, vorpal) {
	let { dir, files } = args;
	let { caslib } = args.options;

	if (files[ 0 ] === '*') {
		files = await fs.readdir(dir);
	}

	let n = files.length;
	for (let i = 0; i < n; i++) {
		
		let f = files[ i ];
		let ix = f.lastIndexOf('.');
		let name = f.substr(f, ix);

		let newArgs = {
			options: {
				file  : `${dir}/${f}`,
				output: `${caslib}.${name}`,

			},
		};

		run1(store, server, newArgs, (err, r) => {
			vorpal.log(err ? err : r);
		});
	
	}

	return 'All cmds processed - waiting on completion';
};

function run1 (store, server, args, cb) {
	upload(store,server, args)
		.then((r) => cb(null, r))
		.catch((e) => cb(e));
}