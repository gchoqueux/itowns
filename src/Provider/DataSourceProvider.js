import Cache from 'Core/Scheduler/Cache';

export default {
    executeCommand(command) {
        const promises = [];
        const commands = command.commands;

        for (const command of commands) {
            // Tag to Cache data
            const tag = command.tag;
            // Get converted source data, in cache or execute command
            promises.push(Cache.get(tag) || Cache.set(tag, command.execute(), Cache.POLICIES.TEXTURE));
        }

        return Promise.all(promises);
    },
};
