import { TestEnvironment } from './test-environment'

// Global setup for Jest
beforeAll(async () => {
  // Initialize test environment
  await TestEnvironment.getInstance().initialize()
}, 30000) // Set timeout to 30 seconds

// Global teardown for Jest
afterAll(async () => {
  await TestEnvironment.getInstance().cleanup()
})
