export default {
    executeCommand(command) {
        return command.nodeLayer.load(command.targetLevel);
    },
};
