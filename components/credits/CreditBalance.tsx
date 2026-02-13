'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Badge, Group, Text, Tooltip, Loader } from '@mantine/core'
import { IconCoins } from '@tabler/icons-react'
import { formatCredits, CreditBalance as CreditBalanceType } from '@/lib/types/credits'

interface CreditBalanceProps {
  compact?: boolean
  showTooltip?: boolean
}

export function CreditBalance({ compact = false, showTooltip = true }: CreditBalanceProps) {
  const [balance, setBalance] = useState<CreditBalanceType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitialLoad = useRef(true)

  const fetchBalance = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const response = await fetch('/api/v1/credits')

      if (!response.ok) {
        throw new Error('Failed to fetch credit balance')
      }

      const data = await response.json()
      setBalance(data.balance)
    } catch (err) {
      console.error('Error fetching credit balance:', err)
      setError('Failed to load credits')
    } finally {
      setLoading(false)
      isInitialLoad.current = false
    }
  }, [])

  useEffect(() => {
    fetchBalance(true)
  }, [fetchBalance])

  // Expose refresh function for external use
  useEffect(() => {
    // Allow other components to trigger a refresh (without loading spinner)
    const handleRefresh = () => fetchBalance(false)
    window.addEventListener('credits:refresh', handleRefresh)
    return () => window.removeEventListener('credits:refresh', handleRefresh)
  }, [fetchBalance])

  if (loading) {
    return (
      <Badge
        variant="light"
        color="gray"
        size={compact ? 'md' : 'lg'}
        leftSection={<Loader size={12} color="gray" />}
      >
        Loading...
      </Badge>
    )
  }

  if (error || !balance) {
    return (
      <Badge
        variant="light"
        color="red"
        size={compact ? 'md' : 'lg'}
        leftSection={<IconCoins size={14} />}
      >
        Error
      </Badge>
    )
  }

  const content = (
    <Badge
      variant="light"
      color={balance.current_balance > 100 ? 'blue' : balance.current_balance > 0 ? 'yellow' : 'red'}
      size={compact ? 'md' : 'lg'}
      leftSection={<IconCoins size={14} />}
      style={{ cursor: showTooltip ? 'help' : 'default' }}
    >
      {formatCredits(balance.current_balance)}
    </Badge>
  )

  if (!showTooltip) {
    return content
  }

  return (
    <Tooltip
      label={
        <div>
          <Text size="sm" fw={600}>Your Megyk Credits</Text>
          <Text size="xs" c="dimmed">
            Lifetime earned: {formatCredits(balance.lifetime_earned)}
          </Text>
          <Text size="xs" c="dimmed">
            Lifetime spent: {formatCredits(balance.lifetime_spent)}
          </Text>
        </div>
      }
      withArrow
      multiline
      w={200}
    >
      {content}
    </Tooltip>
  )
}

/**
 * Trigger a credit balance refresh from anywhere in the app
 */
export function refreshCreditBalance() {
  window.dispatchEvent(new CustomEvent('credits:refresh'))
}
