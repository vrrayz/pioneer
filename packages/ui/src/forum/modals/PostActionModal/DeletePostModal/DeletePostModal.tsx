import { createType } from '@joystream/types'
import { useMachine } from '@xstate/react'
import React, { useEffect, useMemo } from 'react'

import { useMyAccounts } from '@/accounts/hooks/useMyAccounts'
import { useTransactionFee } from '@/accounts/hooks/useTransactionFee'
import { InsufficientFundsModal } from '@/accounts/modals/InsufficientFundsModal'
import { accountOrNamed } from '@/accounts/model/accountOrNamed'
import { FailureModal } from '@/common/components/FailureModal'
import { WaitModal } from '@/common/components/WaitModal'
import { useApi } from '@/common/hooks/useApi'
import { useModal } from '@/common/hooks/useModal'
import { usePostParents } from '@/forum/hooks/usePostParents'
import { useMyMemberships } from '@/memberships/hooks/useMyMemberships'

import { postActionMachine } from '../postActionMachine'
import { PostActionSignModal } from '../PostActionSignModal'
import { PostActionSuccessModal } from '../PostActionSuccessModal'

import { DeletePostModalCall } from '.'

export const DeletePostModal = () => {
  const {
    modalData: { post },
    hideModal,
  } = useModal<DeletePostModalCall>()

  const [state, send] = useMachine(postActionMachine)

  const { active } = useMyMemberships()
  const { allAccounts } = useMyAccounts()
  const { threadId, categoryId } = usePostParents(post.id)
  const { api } = useApi()

  const transaction = useMemo(
    () =>
      api &&
      categoryId &&
      threadId &&
      api.tx.forum.deletePosts(
        createType('ForumUserId', Number.parseInt(post.author.id)),
        [[categoryId, threadId, post.id, true]],
        ''
      ),
    [api, categoryId, threadId]
  )
  const feeInfo = useTransactionFee(active?.controllerAccount, transaction)

  useEffect(() => {
    if (!state.matches('requirementsVerification')) {
      return
    }
    if (transaction && feeInfo && active) {
      feeInfo.canAfford && send('PASS')
      !feeInfo.canAfford && send('FAIL')
    }
  }, [state.value, transaction, feeInfo?.canAfford])

  if (state.matches('requirementsVerification')) {
    return <WaitModal title="Please wait..." description="Checking requirements" onClose={hideModal} />
  }

  if (state.matches('transaction') && transaction) {
    const service = state.children.transaction
    const controllerAccount = accountOrNamed(allAccounts, post.author.controllerAccount, 'Controller Account')
    return (
      <PostActionSignModal
        transaction={transaction}
        service={service}
        controllerAccount={controllerAccount}
        actionText="You intend to delete your post."
      />
    )
  }

  if (state.matches('success')) {
    return <PostActionSuccessModal onClose={hideModal} text="The post has been deleted." />
  }

  if (state.matches('error')) {
    return <FailureModal onClose={hideModal}>There was a problem deleting your post.</FailureModal>
  }

  if (state.matches('requirementsFailed') && active && feeInfo) {
    return (
      <InsufficientFundsModal onClose={hideModal} address={active.controllerAccount} amount={feeInfo.transactionFee} />
    )
  }

  return null
}