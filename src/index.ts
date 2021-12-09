import * as core from '@actions/core';
import { NodeSSH } from 'node-ssh';

const __executeCommand = async (sshInstance: NodeSSH, command: string) => {
	core.info(`Executing: ${command}`);
	const response = await sshInstance.exec(command, [], {
		cwd: core.getInput('cwd', { required: true }),
		stream: 'both',
		onStdout(chunk) {
			console.log(chunk.toString('utf8'));
		},
		onStderr(chunk) {
			console.log(chunk.toString('utf8'));
		}
	});

	if (response.code !== 0) throw new Error(response.stderr);
};

const runAction = async () => {
	core.info(`Running action...`);

	const ssh = new NodeSSH();

	try {
		await ssh.connect({
			host: core.getInput('host', { required: true }),
			port: +core.getInput('port', { required: true }),
			username: core.getInput('username', { required: true }),
			password: core.getInput('password', { required: true })
		});
	} catch (e) {
		console.error('Error connecting to remote server');
		console.error(e);
		core.setFailed('Error connecting to remote server');
		process.abort();
	}

	try {
		await __executeCommand(ssh, `git pull`);
		await __executeCommand(ssh, 'yarn deploy');

		if (ssh.isConnected()) ssh.dispose();
	} catch (e) {
		console.error('Error syncing content');
		console.error(e);
		core.setFailed('Error syncing content');
		process.abort();
	}
};

runAction();
