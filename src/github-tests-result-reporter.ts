import {TestsResultsReporter} from './tests-results-reporter'
import {Annotation, TestResult} from './nunit'
import {getInput} from '@actions/core'
import * as github from '@actions/github'

function generateSummary(annotation: Annotation): string {
  return `* ${annotation.title}\n   ${annotation.message}`
}

export class GithubTestsResultReporter implements TestsResultsReporter {
  public async report(results: TestResult): Promise<any> {
    const numFailures = parseInt(getInput('numFailures'))
    const accessToken = getInput('access-token')
    const title = getInput('reportTitle')
    const octokit = github.getOctokit(accessToken)

    const summary =
      results.failed > 0
        ? `${results.failed} tests failed`
        : `${results.passed} tests passed`

    let details =
      results.failed === 0
        ? `** ${results.passed} tests passed**`
        : `
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

    const pr = github.context.payload.pull_request
    await octokit.rest.checks.create({
      head_sha: (pr && pr['head'] && pr['head'].sha) || github.context.sha,
      name: title,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      status: 'completed',
      conclusion:
        results.failed > 0 || results.passed === 0 ? 'failure' : 'success',
      output: {
        title,
        summary,
        annotations: results.annotations.slice(0, numFailures),
        text: details
      }
    })
  }
}
