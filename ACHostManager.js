/**
 * Copyright (c) 2018-present, SanQiu, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Create by mark on 2019/12/19.
 * @emails a9mm51@gmail.com
 */

import ACSpeedTestModel from './ACSpeedTestModel';

export default class ACHostManager {

    constructor(hosts) {
        // 复制hosts
        this._hosts = [...hosts];
        // 随机一下避免大量请求同一时间请求同一台服务器
        this._hosts = this._hosts.sort(this._random);
        this.speedTestModel = new ACSpeedTestModel();
    }

    async getFastest() {
        try {
            const results = await this.speedTestModel.test(this._hosts);
            const availableResults = results.filter(result => result.available);
            if (availableResults.length === 0) {
                return undefined;
            }
            const sortedResult = availableResults.sort((result1, result2) => {
                // 按延迟从低到高排序
                return result1.delay - result2.delay;
            });
            // 返回第一个即是最快的
            return sortedResult[0];
        } catch (error) {
            console.log(`----------------------------------- error.message :: ${error.message} \n\n`);
            throw error;
        }
    }

    _random = () => Math.random() > 0.5;

}
