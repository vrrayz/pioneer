import { useMemo } from 'react'

import { useGetGroupEventsQuery } from '@/working-groups/queries'
import {
  asApplicationWithdrawnActivity,
  asAppliedOnOpeningActivity,
  asBudgetSpendingActivity,
} from '@/working-groups/types/WorkingGroupActivity'

export const useGroupActivities = (groupId: string) => {
  const { loading, data } = useGetGroupEventsQuery({ variables: { group_eq: groupId } })
  const activities = useMemo(
    () =>
      data
        ? [
            ...data.appliedOnOpeningEvents.map(asAppliedOnOpeningActivity),
            ...data.applicationWithdrawnEvents.map(asApplicationWithdrawnActivity),
            ...data.budgetSpendingEvents.map(asBudgetSpendingActivity),
          ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [data, loading]
  )

  return { isLoading: loading, activities }
}