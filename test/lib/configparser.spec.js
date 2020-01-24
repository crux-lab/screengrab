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

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const parseConfig = require('../../lib/configparser');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('#parseConfig', () => {
    context('without baseURL', () => {
        it('should fail', async () => {
            const result = parseConfig('./test/files/config.no_baseurl.yaml');
            await expect(result).to.be.rejectedWith(Error, 'Base URL must be provided');
        });
    });

    context('without paths', () => {
        it('should fail', async () => {
            const result = parseConfig('./test/files/config.no_path.yaml');
            await expect(result).to.be.rejectedWith(Error, 'Provide at least one path');
        });
    });

    context('without sizes', () => {
        it('should fail', async () => {
            const result = parseConfig('./test/files/config.no_sizes.yaml');
            await expect(result).to.be.rejectedWith(Error, 'Provide at least one size');
        });
    });

    context('without width', () => {
        it('should fail', async () => {
            const result = parseConfig('./test/files/config.no_width.yaml');
            await expect(result).to.be.rejectedWith(Error, 'Each size entry must have a width key');
        });
    });

    context('with full config', () => {
        let result = null;
        beforeEach(async () =>  {
            result = await parseConfig('./test/files/config.yaml');
        });

        it('should parse all paths', async () => {
            expect(result.paths).to.be.eql(['/', 'test']);
        });

        it('should parse baseUrl', async () => {
            expect(result.baseUrl).to.be.equal('http://localhost:4000');
        });

        it('should parse all sizes', async () => {
            expect(result.sizes.length).to.be.equal(2);
        });

        it('should parse provided width', async () => {
            expect(result.sizes[0].width).to.be.equal(320);
        });

        it('should parse provided height', async () => {
            expect(result.sizes[0].height).to.be.equal(480);
        });

        it('should parse provided density', async () => {
            expect(result.sizes[0].density).to.be.equal(2);
        });

        it('should parse provided output', async () => {
            expect(result.output).to.be.equal('screens');
        });

        it('should parse provided batch size', async () => {
            expect(result.batchSize).to.be.equal(5);
        });

        it('should replace batch size -1 with size to launch all tasks in parallel', async () => {
            expect(result.batchSize).to.be.equal(5);
        });
    });

    context('with batch size -1', () => {
        let result = null;
        beforeEach(async () =>  {
            result = await parseConfig('./test/files/config.batch_size_-1.yaml');
        });

        it('should set batch size to launch all tasks in parallel', async () => {
            expect(result.batchSize).to.be.equal(4);
        });
    });

    context('without optional fields', () => {
        let result = null;
        beforeEach(async () => {
            result = await parseConfig('./test/files/config.no_opt.yaml');
        });

        it('should set default height', async () => {
            expect(result.sizes[1].height).to.be.equal(800);
        });

        it('should set default density', async () => {
            expect(result.sizes[1].density).to.be.equal(1);
        });

        it('should set default batch size', async () => {
            expect(result.batchSize).to.be.equal(1);
        });
    });

    context('without optional fields with overrides', () => {
        let result = null;
        beforeEach(async () => {
            result = await parseConfig('./test/files/config.no_opt.yaml', 100, 3);
        });

        it('should set overridden default height', async () => {
            expect(result.sizes[1].height).to.be.equal(100);
        });

        it('should set overridden default density', async () => {
            expect(result.sizes[1].density).to.be.equal(3);
        });
    });
});
