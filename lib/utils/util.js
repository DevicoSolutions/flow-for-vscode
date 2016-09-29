/** @flow */

import spawn from 'cross-spawn';
import {window, workspace} from 'vscode'
import {getServerStatusUpdates} from '../pkg/flow-base/lib/FlowService'

const NODE_NOT_FOUND = '[Flow] Cannot find node in PATH. The simpliest way to resolve it is install node globally'
const FLOW_NOT_FOUND = '[Flow] Cannot find flow in PATH. Try to install it by npm install flow-bin -g'

function getPathToFlow(): string {
	return workspace.getConfiguration('flow').get('pathToFlow')
}

export function isFlowEnabled() {
	return workspace.getConfiguration('flow').get('enabled')
}

export function subscribeFlowServerStatus() {
	const source = getServerStatusUpdates()
	let disposable = null
	source
		.filter(({status}) => status === 'unknown')
		.subscribe(() => disposable = window.setStatusBarMessage('Wait for Flow Server...'))
	source
		.filter(({status}) => status === 'ready')
		.subscribe(() => {
			if (disposable) {
				disposable.dispose()
				disposable = null
			}
		})
}

export function checkNode() {
	try {
		const check = spawn(process.platform === 'win32' ? 'where' : 'which', ['node'])
		let
		  flowOutput = "",
			flowOutputError = ""
		check.stdout.on('data', function (data) {
			flowOutput += data.toString();
		})
		check.stderr.on('data', function (data) {
			flowOutputError += data.toString();
		})
		check.on('exit', function (code) {
			if (code != 0) {
				window.showErrorMessage(NODE_NOT_FOUND);
			}
		})
	} catch(e) {
		window.showErrorMessage(NODE_NOT_FOUND);
	}
}

export function checkFlow() {
	try {
		const check = spawn(process.platform === 'win32' ? 'where' : 'which', [getPathToFlow()])
		let
		  flowOutput = "",
			flowOutputError = ""
		check.stdout.on('data', function (data) {
			flowOutput += data.toString();
		})
		check.stderr.on('data', function (data) {
			flowOutputError += data.toString();
		})
		check.on('exit', function (code) {
			if (code != 0) {
				window.showErrorMessage(FLOW_NOT_FOUND);
			}
		})
	} catch(e) {
		window.showErrorMessage(FLOW_NOT_FOUND);
	}
}