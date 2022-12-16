type CommonError = {
  message: string
}

function isCommonError(error: unknown): error is CommonError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function convertToCommonError(error: unknown): CommonError {
  if (isCommonError(error)) {
    return error
  }
  try {
    return new Error(JSON.stringify(error))
  } catch (error) {
    return new Error(String(error))
  }
}

export function getErrorMessage(error: unknown): string {
  return convertToCommonError(error).message
}
