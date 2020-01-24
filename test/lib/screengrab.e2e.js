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

const fs = require('fs');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const PNG = require('pngjs').PNG;
const ScreenGrab = require('../../lib/screengrab');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ScreenGrab E2E', () => {
    describe('.createScreenshots', () => {
        const config = {
            baseUrl: `file://${__dirname}/../files/`,
            paths: ['test.html'],
            output: `${__dirname}/../tmp/`,
            sizes: [{
                width: 320,
                height: 100,
                density: 2
            }],
            batchSize: 1,
        };

        const expectedFilename = "test.html_320_100@2x.png";

        let screenGrab = null;

        afterEach(() =>  {
            fs.rmdirSync(config.output, { recursive: true });
        });

        it('should create images with correct width', async () => {
            screenGrab = new ScreenGrab(config);
            await screenGrab.createScreenshots();
            const buf = fs.readFileSync(`${config.output}/${expectedFilename}`);
            const screenshot = PNG.sync.read(buf);
            expect(screenshot.width).to.equal(640);
        });

        context('if folder doesn\'t exist', () => {
            beforeEach(async () =>  {
                if (fs.existsSync(config.output)) {
                    fs.rmdirSync(config.output, { recursive: true });
                }
                screenGrab = new ScreenGrab(config);
                await screenGrab.createScreenshots();

            });

            it('should create folder and screenshots', async () => {
                expect(fs.existsSync(config.output)).to.be.true;
                expect(fs.existsSync(`${config.output}/${expectedFilename}`)).to.be.true;
            });
        });

        context('if folder exists', () => {
            beforeEach(async () =>  {
                if (!fs.existsSync(config.output)) {
                    fs.mkdirSync(config.output);
                }
                screenGrab = new ScreenGrab(config);
                await screenGrab.createScreenshots();
            });

            it('should create screenshots', async () => {
                expect(fs.existsSync(`${config.output}/${expectedFilename}`)).to.be.true;
            });
        });

        context('if unable to open page', () => {
            const badConfig = {
                baseUrl: `file://${__dirname}/../files/`,
                paths: ['invalid'],
                output: `${__dirname}/../tmp/`,
                sizes: [{
                    width: 100,
                    height: 100,
                    density: 2
                }],
                batchSize: 1
            };

            it ('should throw an error', async () => {
                screenGrab = new ScreenGrab(badConfig);
                const result = screenGrab.createScreenshots();
                await expect(result).to.be.rejectedWith(Error, 'Unable to open page');
            });
        });
    });
});
