// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
