import { Job, JobType, Queue, Worker } from "bullmq";

const q = new Queue('jobs');

async function main() {
    for(let i = 0; i < 14; i++){
        // These jobs will be processed successfully
        await q.add('successful_job', {});
    }
    for(let i = 0; i < 14; i++){
        // These jobs will fail
        await q.add('failing_job', {});
    }

    // Create a worker that processes jobs
    // If the job is of type 'failing_job', it throws an error, simulating a failed job
    const worker = new Worker('jobs', async (job: Job) => {
        if (job.name === 'failing_job') {
            throw new Error('Job failed');
        }
    });

    let status:JobType[] = ['completed', 'failed', 'waiting', 'active', 'delayed'];

    // Give some delay to allow worker to process some jobs
    await new Promise(resolve => setTimeout(resolve, 1000));

    const total = await q.getJobCountByTypes(...status); 
    const limit = 10;
    let start =  0;
    let end;
    console.log('total', total);
    while(start < total){
        end = start + limit - 1;
        console.log(`query: ${start} - ${end}`);
        // Test old function
        const jobs = await q.getJobs(status, start, end, false);
        // uncomment to test new function
        // const jobs = await q.getJobsAsync(start, end, false);
        console.log("Jobs: ",JSON.stringify(jobs));
        console.log('jobs returned: ', jobs.length);
        start += limit;
    }

    await worker.close();
}

main();