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

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const executeBatch = require('./batchexecutor');

class ScreenGrab {
    constructor(config) {
        this.output = config.output;
        this.baseURL = config.baseUrl;
        this.paths = config.paths;
        this.sizes = config.sizes;
        this.batchSize = config.batchSize;
    }

    async createScreenshots() {
        const browser = await puppeteer.launch();
        const allPromises = [];

        try {
            for (const sitePath of this.paths) {
                for (const size of this.sizes) {
                    const filePath = this._generateFileName(sitePath, size);
                    allPromises.push(async () => this._grabScreenshot(browser, sitePath, size, filePath));
                }
            }
            await executeBatch(allPromises, this.batchSize);
        } finally {
            await browser.close();
        }
    }

    _generateFileName(sitePath, size) {
        let sanitizedName = sitePath.split('/').join("_"); // replace all occurrences of / with _
        if (sanitizedName === '_') {
            sanitizedName = 'index';
        }
        const fileName = `${sanitizedName}_${size.width}_${size.height}@${size.density}x.png`;
        return path.join(this.output, fileName);
    }

    async _grabScreenshot(browser, sitePath, size, filePath) {
        const page = await browser.newPage();
        await page.setViewport({
            width: size.width,
            height: size.height,
            deviceScaleFactor: size.density,
        });

        try {
            await page.goto(new URL(sitePath, this.baseURL), {
                waitUntil: 'networkidle2'
            });
        } catch (e) {
            throw new Error(`Unable to open page ${sitePath}: ${e.message}`);
        }

        await this._setupOutput();
        await page.screenshot({path: filePath, fullPage: true});
        await page.close();
    }

    async _setupOutput() {
        const dirExists = await fs.access(this.output).then(() => true).catch(() => false);
        if (!dirExists) {
            await fs.mkdir(this.output);
        }
    }
}

module.exports = ScreenGrab;
