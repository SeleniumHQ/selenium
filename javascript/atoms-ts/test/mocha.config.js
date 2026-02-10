module.exports = {
    require: ['ts-node/register'],
    extensions: ['ts'],
    spec: ['src/**/*.test.ts'],
    timeout: 20000,
    reporter: 'spec',
    ui: 'bdd'
};
