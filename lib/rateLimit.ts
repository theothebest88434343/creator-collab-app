const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(userId: string, limit = 10, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now()
  const record = requestCounts.get(userId)

  if (!record || now > record.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false

  record.count++
  return true
}