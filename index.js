const { MongoClient } = require("mongodb")

const client = new MongoClient('mongodb://127.0.0.1:27017/test')

const Numbers = client.db('test').collection('numbers')

const documentCount = 20_000

async function populateDatabase() {
	console.log('Populating database...')
	await Numbers.deleteMany({})
	const promises = []
	for (let i = 0; i < documentCount; i++) {
		const insert = Numbers.insertOne({
			num: Math.random()
		})
		promises.push(insert)
	}
	await Promise.all(promises)
	console.log('Populate done')
}

async function iterateOnSomeData() {
	const query = Numbers.find()
		.sort({ num: 1 })

	let counter = 0
	const docs = []
	for await (const doc of query) {
		docs.push(doc)
		counter++
		// Commenting the next line solves the memory leak
		if (counter > documentCount / 2) break
	}
}

const formatMemoryUsage = data => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

function printMemoryUsage() {
	const memoryData = process.memoryUsage()

	console.log({
		rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
		heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
		heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
		external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
	})

	console.log(
		new Date().toISOString(),
		'sessionPool:', client.s.sessionPool.sessions.length,
		'activeSessions:', client.s.activeSessions.size
	)
}

function startIntervals() {
	console.log('Starting iterations')
	const iosd = setInterval(iterateOnSomeData, 10)
	const pmu = setInterval(printMemoryUsage, 1000)
	setTimeout(() => {
		console.log('Stopping timers')
		clearInterval(iosd)
		clearInterval(pmu)
		gc()
		printMemoryUsage()
	}, 1 * 60 * 1000)
}

client.connect()
	.then(populateDatabase)
	.then(startIntervals)
