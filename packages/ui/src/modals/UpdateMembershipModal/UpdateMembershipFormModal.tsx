import { blake2AsHex } from '@polkadot/util-crypto'
import React, { Reducer, useEffect, useReducer } from 'react'
import * as Yup from 'yup'
import { AnySchema } from 'yup'
import { Address, BaseMember } from '../../common/types'
import { Button } from '../../components/buttons'
import { Label, TextArea, TextInput } from '../../components/forms'
import { FieldError, hasError } from '../../components/forms/FieldError'
import {
  ModalFooter,
  ModalHeader,
  ScrolledModal,
  ScrolledModalBody,
  ScrolledModalContainer,
} from '../../components/Modal'
import { Text } from '../../components/typography'
import { useApi } from '../../hooks/useApi'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useObservable } from '../../hooks/useObservable'
import { AvatarURISchema, HandleSchema } from '../../membership/data/validation'
import { Row } from '../common'

interface Props {
  onClose: () => void
  onSubmit: (params: UpdateMemberForm) => void
  member: BaseMember
}

export interface UpdateMemberForm {
  id: string
  name?: string
  handle?: string
  avatarURI?: string
  about?: string
}

export type Action<T> = {
  type: keyof T
  value?: T[keyof T]
}

const UpdateMemberSchema = Yup.object().shape({
  avatarURI: AvatarURISchema.nullable(),
  handle: Yup.string().when('$isHandleChanged', (isHandleChanged: boolean, schema: AnySchema) => {
    return isHandleChanged ? HandleSchema : schema
  }),
})

type FormReducer<T> = Reducer<T, Action<T>>

const updateReducer: FormReducer<UpdateMemberForm> = (state, action): UpdateMemberForm => {
  return { ...state, [action.type]: action.value }
}

const checkEdits = (formData: Record<string, any>, member: Record<string, any>) => {
  for (const key of Object.keys(formData)) {
    if ((member[key] || '') !== (formData[key] || '')) {
      return true
    }
  }

  return false
}

export const UpdateMembershipFormModal = ({ onClose, onSubmit, member }: Props) => {
  const { api } = useApi()

  const [state, dispatch] = useReducer(updateReducer, {
    id: member.id,
    name: member.name || '',
    handle: member.handle || '',
    about: member.about || '',
    avatarURI: member.avatarURI || '',
  })
  const { handle, name, avatarURI, about } = state

  const handleHash = blake2AsHex(handle || '')
  const potentialMemberIdSize = useObservable(api?.query.members.memberIdByHandleHash.size(handleHash), [handle])
  const { isValid, errors, validate } = useFormValidation<UpdateMemberForm>(UpdateMemberSchema)

  const canUpdate = isValid && checkEdits(state, member)

  useEffect(() => {
    validate(state, { size: potentialMemberIdSize, isHandleChanged: state.handle !== member.handle })
  }, [state, potentialMemberIdSize])

  const changeField = (type: keyof UpdateMemberForm, value: string | Address) => {
    dispatch({ type, value })
  }

  const onCreate = () => {
    if (canUpdate) {
      onSubmit(state)
    }
  }

  return (
    <ScrolledModal modalSize="m" modalHeight="m" onClose={onClose}>
      <ModalHeader onClick={onClose} title="Edit membership" />
      <ScrolledModalBody>
        <ScrolledModalContainer>
          <Row>
            <Label htmlFor="member-name" isRequired>
              Member Name
            </Label>
            <TextInput
              id="member-name"
              type="text"
              placeholder="Type"
              value={name}
              onChange={(event) => changeField('name', event.target.value)}
            />
          </Row>

          <Row>
            <Label htmlFor="member-handle" isRequired>
              Membership handle
            </Label>
            <TextInput
              id="member-handle"
              type="text"
              placeholder="Type"
              value={handle}
              onChange={(event) => changeField('handle', event.target.value)}
              invalid={hasError('handle', errors)}
            />
            <FieldError name="handle" errors={errors} />
          </Row>

          <Row>
            <Label htmlFor="member-about">About Member</Label>
            <TextArea
              id="member-about"
              value={about}
              placeholder="Type"
              rows={4}
              onChange={(event) => changeField('about', event.target.value)}
            />
          </Row>

          <Row>
            <Label htmlFor="member-avatar">Member Avatar</Label>
            <TextInput
              id="member-avatar"
              type="text"
              placeholder="Image URL"
              value={avatarURI}
              onChange={(event) => changeField('avatarURI', event.target.value)}
              invalid={hasError('avatarURI', errors)}
            />
            <Text size={3} italic={true}>
              Paste an URL of your avatar image. Text lorem ipsum.
            </Text>
            <FieldError name="avatarURI" errors={errors} />
          </Row>
        </ScrolledModalContainer>
      </ScrolledModalBody>
      <ModalFooter>
        <Button size="medium" onClick={onCreate} disabled={!canUpdate}>
          Save changes
        </Button>
      </ModalFooter>
    </ScrolledModal>
  )
}