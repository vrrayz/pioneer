import React from 'react'
import styled from 'styled-components'
import { MemberFieldsFragment } from '../../../../api/queries'
import { AddMembershipButtonSwitch } from '../../../../components/AddMembershipButtonSwitch'
import { MembershipsCount } from '../../../../components/MembershipCount'
import { BorderRad, Colors, Transitions } from '../../../../constants'
import { useMembership } from '../../../../hooks/useMembership'
import { MemberDarkHover, MemberInfo } from '../../../MemberInfo'
import { CloseSmallModalButton, Modal, ModalBody, ModalFooter, ModalTitle } from '../../../Modal'
import { Notification, NotificationComponent } from '../../../Notification'

interface Props {
  onClose: () => void
}

export const SwitchMemberModal = ({ onClose }: Props) => {
  const { members, setActive } = useMembership()
  const switchMember = (member: MemberFieldsFragment) => {
    setActive(member)
    onClose()
  }

  return (
    <Modal modalSize="xs" modalHeight="s" isDark>
      <SwitchModalBody>
        <CloseSmallModalButton onClick={onClose} />
        <SwitchModalTitle>Select Membership</SwitchModalTitle>
        <MembershipsCount />
        <MembersList>
          {members.map((member) => (
            <MemberItem key={member.handle} onClick={() => switchMember(member)}>
              <MemberInfo member={member} isOnDark={true} />
              <Notification />
            </MemberItem>
          ))}
        </MembersList>
      </SwitchModalBody>
      <SwitchModalFooter>
        <AddMembershipButtonSwitch />
      </SwitchModalFooter>
    </Modal>
  )
}

const SwitchModalBody = styled(ModalBody)`
  position: relative;
  padding: 16px;
  grid-row-gap: 16px;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: calc(100% - 32px);
    height: 1px;
    background-color: ${Colors.Black[700]};
    transform: translateX(-50%);
  }
`

const SwitchModalTitle = styled(ModalTitle)`
  line-height: 40px;
`

const SwitchModalFooter = styled(ModalFooter)`
  width: 100%;
  height: auto;
  padding: 16px;
`

const MembersList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-height: 192px;
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const MemberItem = styled.li`
  display: grid;
  grid-template-columns: 1fr 16px;
  grid-column-gap: 8px;
  align-items: center;
  width: 100%;
  height: 100%;
  max-height: 64px;
  padding: 12px 16px;
  border-radius: ${BorderRad.s};
  transition: ${Transitions.all};
  cursor: pointer;

  &:hover,
  &:focus {
    outline: none;
    background-color: ${Colors.Black[600]};

    ${NotificationComponent} {
      color: ${Colors.White};
    }
    ${MemberDarkHover}
  }
`