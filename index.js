"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const q = new bullmq_1.Queue('jobs');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 14; i++) {
            // These jobs will be processed successfully
            yield q.add('successful_job', {});
        }
        for (let i = 0; i < 14; i++) {
            // These jobs will fail when processed
            yield q.add('failing_job', {});
        }
        // Create a worker that processes jobs
        // If the job is of type 'failing_job', it throws an error, simulating a failed job
        const worker = new bullmq_1.Worker('jobs', (job) => __awaiter(this, void 0, void 0, function* () {
            if (job.name === 'failing_job') {
                throw new Error('Job failed');
            }
        }));
        let status = ['completed', 'failed', 'waiting', 'active', 'delayed'];
        // Give some delay to allow worker to process some jobs
        yield new Promise(resolve => setTimeout(resolve, 1000));
        const total = yield q.getJobCountByTypes(...status);
        const limit = 10;
        let start = 0;
        let end;
        console.log('total', total);
        while (start < total) {
            end = start + limit - 1;
            console.log(`query: ${start} - ${end}`);
            const jobs = yield q.getJobs(status, start, end, false);
            // const jobs = await q.getJobsAsync(start, end, false);
            console.log("Jobs: ", JSON.stringify(jobs));
            console.log('jobs returned: ', jobs.length);
            start += limit;
        }
        yield worker.close();
    });
}
main();
