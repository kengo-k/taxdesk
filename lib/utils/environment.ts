export type Environment = 'local' | 'production'

export function getEnvironment(): Environment {
  if (process.env.NODE_ENV === 'production') {
    return 'production'
  }
  return 'local'
}

export function getEnvironmentConfig(environment: Environment) {
  switch (environment) {
    case 'production':
      return {
        name: 'Production',
        color: 'bg-red-600 text-white',
        textColor: 'text-red-600',
      }
    case 'local':
      return {
        name: 'Local',
        color: 'bg-green-600 text-white',
        textColor: 'text-green-600',
      }
    default:
      return {
        name: 'Unknown',
        color: 'bg-gray-600 text-white',
        textColor: 'text-gray-600',
      }
  }
}
