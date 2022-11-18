import {Annotation, readResults} from './nunit'
import {LogToServerTestsResultsReporter} from './log to-server-tests-results-reporter'

function generateSummary(annotation: Annotation): string {
  return `* ${annotation.title}\n   ${annotation.message}`
}

async function run(): Promise<void> {
  try {
    const results = await readResults('./__tests__/playmode2-results.xml')
    let details = `
**${results.passed} tests passed**
**${results.failed} tests failed**
`

    for (const ann of results.annotations) {
      const annStr = generateSummary(ann)
      const newDetails = `${details}\n${annStr}`
      if (newDetails.length > 65000) {
        details = `${details}\n\n ... and more.`
        break
      } else {
        details = newDetails
      }
    }

    const testsResultsReporters = [new LogToServerTestsResultsReporter()]

    for (const testsResultsReporter of testsResultsReporters) {
      await testsResultsReporter.report(results)
    }

    console.log(details)
  } catch (error) {
    console.log((error as Error).message)
  }
}

run()
