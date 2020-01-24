/**
 * Copyright 2020 Cruxlab, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs').promises;
const yaml = require('js-yaml');

function _validateConfig(data, defaultHeight, defaultDensity) {
    if (defaultHeight === undefined) {
        defaultHeight = 800;
    }

    if (defaultDensity === undefined) {
        defaultDensity = 1;
    }

    if (!data.baseUrl) {
        throw new Error("Base URL must be provided");
    }

    if (!data.paths || data.paths.length < 1) {
        throw new Error("Provide at least one path");
    }

    if (!data.sizes || data.sizes.length < 1) {
        throw new Error("Provide at least one size");
    }

    if (!data.batchSize) {
        data.batchSize = 1;
    } else if (data.batchSize === -1) {
        data.batchSize = data.sizes.length * data.paths.length;
    }

    for (const size of data.sizes) {
        if (!size.width) {
            throw new Error("Each size entry must have a width key");
        }

        if (!size.height) {
            size.height = defaultHeight;
        }

        if (!size.density) {
            size.density = defaultDensity;
        }
    }
}

module.exports = async (configFile, defaultHeight, defaultDensity) => {
    let data;
    try {
        const fileContents = await fs.readFile(configFile, 'utf8');
        data = yaml.safeLoad(fileContents);
        _validateConfig(data, defaultHeight, defaultDensity);
    } catch (e) {
        throw new Error(`Unable to parse the config file: ${e}`);
    }

    return {
        baseUrl: data.baseUrl,
        paths: data.paths,
        sizes: data.sizes,
        output: data.output,
        batchSize: data.batchSize
    };
};
