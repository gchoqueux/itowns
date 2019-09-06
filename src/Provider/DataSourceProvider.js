import Cache from 'Core/Scheduler/Cache';

// function isValidData(data, extentDestination, validFn) {
//     if (data && (!validFn || validFn(data, extentDestination))) {
//         return data;
//     }
// }

// const error = (err, url, source, type) => {
//     source.handlingError(err, url, type);
//     throw err;
// };

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
