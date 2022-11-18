import {getInput, setFailed} from '@actions/core'
import {readResults} from './nunit'
import {LogToServerTestsResultsReporter} from './log to-server-tests-results-reporter'
import {GithubTestsResultReporter} from './github-tests-result-reporter'

async function run(): Promise<void> {
  try {
    const path = getInput('path')
    const results = await readResults(path)
    const testsResultsReporters = [
      new GithubTestsResultReporter(),
      new LogToServerTestsResultsReporter()
    ]

    for (const testsResultsReporter of testsResultsReporters) {
      await testsResultsReporter.report(results)
    }
  } catch (error) {
    setFailed((error as Error).message)
  }
}

run()
