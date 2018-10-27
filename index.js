'use strict';
const alfy = require('alfy');
const translate = require('google-translate-api');

const q = alfy.input.slice(1);
const to = alfy.input.slice(0, 1) === 'e' ? 'pt' : 'en';
const from = alfy.input.slice(0, 1) === 'e' ? 'en' : 'pt';

const opt = {
	raw: true,
	_to: to,
	get to() {
		return this._to;
	},
	set to(value) {
		this._to = value;
	}
};

translate(q, opt).then(data => {
	const output = {
		variables: {
			pronounce: 0
		},
		items: []
	};

	const rawObj = JSON.parse(data.raw);
	const autoCorrected = !data.from.text.autoCorrected;

	if (autoCorrected) {
		if (rawObj[1]) {
			rawObj[1].forEach(r => {
				const partOfSpeech = r[0];
				r[2].forEach(x => {
					const text = x[0];
					const relation = x[1];
					output.items.push({
						title: text,
						subtitle: `(${partOfSpeech}) ${relation.join(', ')}`,
						arg: text,
						mods: {
							cmd: {
								subtitle: 'Please press [enter]',
								variables: {
									pronounce: 1
								}
							}
						},
						quicklookurl: `https://translate.google.com.br/#${from}/${to}/${encodeURIComponent(q)}`
					});
				});
			});
		} else {
			output.items.push({
				title: data.text,
				subtitle: '',
				arg: data.text,
				mods: {
					cmd: {
						subtitle: 'Please press [enter]',
						variables: {
							pronounce: 1
						}
					}
				},
				quicklookurl: `https://translate.google.com.br/#${from}/${to}/${encodeURIComponent(q)}`
			});
		}
	} else {
		const corrected = data.from.text.value.replace(/\[/, '').replace(/\]/, '');
		output.items.push({
			title: data.text,
			subtitle: `What you are looking for is ${corrected} what?, Please press [tab] to find out more`,
			autocomplete: corrected
		});
	}

	console.log(JSON.stringify(output, null, '\t'));
});
