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

function _chunkWork(promises, batchSize) {
    if (batchSize < 1) {
        throw new Error("Batch size should be larger than 0");
    }

    const chunks = [];
    const promisesLength = promises.length;
    for (let index = 0; index < promisesLength; index += batchSize) {
        chunks.push(promises.slice(index, index + batchSize));
    }

    return chunks;
}

module.exports = async (promises, batchSize) => {
    const chunkedPromises = _chunkWork(promises, batchSize);
    return chunkedPromises.reduce(async (previousChunk, currentChunk) => {
        await previousChunk;
        await Promise.all(currentChunk.map(func => func()));
    }, Promise.resolve());
};
