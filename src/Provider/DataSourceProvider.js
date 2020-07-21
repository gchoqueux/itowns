export default {
    executeCommand(command) {
        const layer = command.layer;
        const froms = command.extentsSource;
        const tos = command.extentsDestination || froms;

        return Promise.all(froms.map((from, i) => (from ? layer.getData(from, tos[i]) : undefined)));
    },
};
