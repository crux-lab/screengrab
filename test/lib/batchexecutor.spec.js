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
const executeBatch = require('../../lib/batchexecutor');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('#executeBatch', function () {
    it('should reject invalid batch size', async () => {
        const result = executeBatch([], 0);
        await expect(result).to.be.rejectedWith(Error, 'Batch size should be larger');
    });

    it('should chunk promises into batches of given size', async () => {
        let currentIteration = 0;
        let maxConcurrent = 0;

        const iter = async () => {
            currentIteration++;
            if (currentIteration > maxConcurrent) {
                maxConcurrent = currentIteration;
            }
            await new Promise(r => setTimeout(r, 10));
            currentIteration = 0;
        };

        await executeBatch([
            iter, iter, iter,
            iter, iter, iter
        ], 2);

        expect(maxConcurrent).to.equal(2);
    });

    it('should fail if one promise fails', async () => {
        let successPromises = 0;
        const success = async () =>  {
            await new Promise(r => setTimeout(r, 10));
            successPromises++;
        };
        const fail = async () => {
            await new Promise(r => setTimeout(r, 10));
            throw new Error("Some error occurred");
        };

        const result = executeBatch([
            success, success, fail,
            success, fail, success
        ], 3);

        await expect(result).to.be.rejectedWith(Error, 'Some error occurred');
        expect(successPromises).to.equal(2);
    });
});
