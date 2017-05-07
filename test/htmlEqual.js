const assert = require('assert');
const { JSDOM } = require('jsdom');

function cleanChildren(node) {
	let previous = null;

	[...node.childNodes].forEach(child => {
		if (child.nodeType === 8) {
			// comment
			node.removeChild(child);
			return;
		}

		if (child.nodeType === 3) {
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/\s{2,}/, '\n');

			// text
			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/\s{2,}/, '\n');

				node.removeChild(child);
				child = previous;
			}
		} else {
			cleanChildren(child);
		}

		previous = child;
	});

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === 3) {
		node.firstChild.data = node.firstChild.data.replace(/^\s+/, '');
		if (!node.firstChild.data) node.removeChild(node.firstChild);
	}

	if (node.lastChild && node.lastChild.nodeType === 3) {
		node.lastChild.data = node.lastChild.data.replace(/\s+$/, '');
		if (!node.lastChild.data) node.removeChild(node.lastChild);
	}
}

const { window } = new JSDOM('');

assert.htmlEqual = (actual, expected, message) => {
	window.document.body.innerHTML = actual.replace(/>[\s\r\n]+</g, '><').trim();
	cleanChildren(window.document.body, '');
	actual = window.document.body.innerHTML;

	window.document.body.innerHTML = expected
		.replace(/>[\s\r\n]+</g, '><')
		.trim();
	cleanChildren(window.document.body, '');
	expected = window.document.body.innerHTML;

	assert.deepEqual(actual, expected, message);
};
