'use client'

import { Badge, Text, Tooltip } from '@mantine/core'
import { IconCoins } from '@tabler/icons-react'
import { formatCredits } from '@/lib/types/credits'

interface CreditCostBadgeProps {
  cost: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showIcon?: boolean
  tooltip?: string
}

export function CreditCostBadge({
  cost,
  size = 'sm',
  showIcon = true,
  tooltip,
}: CreditCostBadgeProps) {
  const badge = (
    <Badge
      variant="outline"
      color="blue"
      size={size}
      leftSection={showIcon ? <IconCoins size={12} /> : undefined}
    >
      {formatCredits(cost)}
    </Badge>
  )

  if (tooltip) {
    return (
      <Tooltip label={tooltip} withArrow>
        {badge}
      </Tooltip>
    )
  }

  return badge
}

interface CreditCostDisplayProps {
  cost: number
  balance: number
  showWarning?: boolean
}

/**
 * Display credit cost with balance comparison
 */
export function CreditCostDisplay({
  cost,
  balance,
  showWarning = true,
}: CreditCostDisplayProps) {
  const canAfford = balance >= cost
  const remaining = balance - cost

  return (
    <div>
      <Text size="sm" c="dimmed" mb={4}>
        Cost: <Text span fw={600} c={canAfford ? 'blue' : 'red'}>{formatCredits(cost)}</Text>
      </Text>
      {showWarning && !canAfford && (
        <Text size="xs" c="red">
          You need {formatCredits(Math.abs(remaining))} more credits
        </Text>
      )}
      {canAfford && (
        <Text size="xs" c="dimmed">
          Remaining after: {formatCredits(remaining)}
        </Text>
      )}
    </div>
  )
}
