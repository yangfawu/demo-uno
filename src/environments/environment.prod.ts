export const environment = {
    production: true,
    ratio: 1536/754,
    delays: {
        alertClient: {
            min: 6e2,
            max: 7e2
        },
        moveInit: {
            min: 6e2,
            max: 1e3
        },
        moveDuration: {
            min: 9e2,
            max: 1.5e3
        },
        unoCall: {
            min: 1e3,
            max: 2e3
        }
    }
};