import * as core from '@actions/core';
import { NodeSSH } from 'node-ssh';

const __executeCommand = async (sshInstance: NodeSSH, command: string) => {
	core.info(`Executing: ${command}`);
	const wrappedCommand = `source ~/.nvm/nvm.sh 2>/dev/null; ${command}`;
	const response = await sshInstance.exec(wrappedCommand, [], {
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

const detectPackageManager = async (sshInstance: NodeSSH): Promise<string> => {
	const explicit = core.getInput('package_manager');
	if (explicit) {
		core.info(`Using explicitly configured package manager: ${explicit}`);
		return explicit;
	}

	const cwd = core.getInput('cwd', { required: true });

	try {
		const result = await sshInstance.exec('test', ['-f', 'pnpm-lock.yaml'], {
			cwd,
			stream: 'both'
		});
		if (result.code === 0) {
			core.info('Detected pnpm (found pnpm-lock.yaml)');
			return 'pnpm';
		}
	} catch {
		// not found, continue
	}

	core.info('Defaulting to yarn');
	return 'yarn';
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
		const pm = await detectPackageManager(ssh);

		await __executeCommand(ssh, `git pull`);
		await __executeCommand(ssh, `${pm} deploy`);

		if (ssh.isConnected()) ssh.dispose();
	} catch (e) {
		console.error('Error syncing content');
		console.error(e);
		core.setFailed('Error syncing content');
		process.abort();
	}
};

runAction();
