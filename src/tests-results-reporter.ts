import {TestResult} from './nunit'

export interface TestsResultsReporter {
  report(results: TestResult): Promise<any>
}
