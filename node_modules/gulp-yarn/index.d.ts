declare module 'gulp-yarn' {
    interface IGulpYarnOptions {
        /**
         * Using the `--production` flag, or when the NODE_ENV environment variable is set to production, Yarn will not install any package
         * listed in devDependencies.
         */
        production?: boolean;
        /**
         * Yarn will only install listed devDependencies.
         */
        dev?: boolean;
        /**
         * Only allow one version of a package. On the first run this will prompt you to choose a single version for each package that is
         * depended on at multiple version ranges.
         */
        flat?: boolean;
        /**
         * This refetches all packages, even ones that were previously installed.
         */
        force?: boolean;
        /**
         * Ignore all the required engines force by some packages.
         */
        ignoreEngines?: boolean;
        /**
         * None of `node_module` bin links getting created.
         */
        noBinLinks?: boolean;
        /**
         * Disable progress bar
         */
        noProgress?: boolean;
        /**
         * Don't read or generate a lockfile
         */
        noLockfile?: boolean;
        /**
         * Don't run npm scripts during installation
         */
        ignoreScripts?: boolean;
        /**
         * Using the `--non-interactive` flag of yarn to avoid that during the resolution (yarn install) a user input is needed. 2770
         */
        nonInteractive?: boolean;
        /**
         * Pass any argument with `--` to execute with yarn
         */
        args?: string | string[];
    }

    const gulpYarn: (options?: IGulpYarnOptions) => NodeJS.ReadStream;

    export = gulpYarn;
  }
