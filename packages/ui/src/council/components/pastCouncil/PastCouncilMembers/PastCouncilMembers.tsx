import React from 'react'

import { List, ListItem } from '@/common/components/List'
import { ListHeader, ListHeaders } from '@/common/components/List/ListHeader'
import { Loading } from '@/common/components/Loading'
import { RowGapBlock } from '@/common/components/page/PageContent'
import { PastCouncilMembersItem } from '@/council/components/pastCouncil/PastCouncilMembers/PastCouncilMembersItem'
import { usePastCouncilMembers } from '@/council/hooks/usePastCouncilMembers'

interface Props {
  councilId: string
}

export const PastCouncilMembers = ({ councilId }: Props) => {
  const { isLoading, councilMembers } = usePastCouncilMembers(councilId)

  if (isLoading) {
    return <Loading />
  }

  return (
    <RowGapBlock gap={4}>
      <ListHeaders $colLayout="276px 128px 128px 128px 128px 104px">
        <ListHeader>Council member</ListHeader>
        <ListHeader>Proposals approved</ListHeader>
        <ListHeader>Proposals rejected</ListHeader>
        <ListHeader>Proposals slashed</ListHeader>
        <ListHeader>Proposals abstained</ListHeader>
      </ListHeaders>
      <List>
        {councilMembers?.map((councilMember, index) => (
          <ListItem key={index} borderless>
            <PastCouncilMembersItem councilMember={councilMember} />
          </ListItem>
        ))}
      </List>
    </RowGapBlock>
  )
}