import {TestsResultsReporter} from './tests-results-reporter'
import {TestResult} from './nunit'
import axios from 'axios'
import * as github from '@actions/github'

export class LogToServerTestsResultsReporter implements TestsResultsReporter {
  public async report(results: TestResult): Promise<any> {
    const logServerUlr = 'http://134.122.5.212:3003/log'

    for (const annotation of results.annotations) {
      const data = {
        log_type: 'github_actions',
        message: 'Test Failed',
        repository: github.context.repo.repo,
        branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF,
        class: annotation.class_name,
        test: annotation.method_name
      }
      const response = await axios.post(logServerUlr, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      })
      if (response.status != 200) {
        throw new Error(
          `Request failed, data='${JSON.stringify(
            data
          )}', logServerUlr='${logServerUlr}'`
        )
      }
    }
  }
}
