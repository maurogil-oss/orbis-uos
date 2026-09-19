import pb from '@/lib/pocketbase/client'
import { UserRole } from '@/contexts/AuthContext'
import { registerAuditEvent } from './institucionalSettings'

export interface ManagedUserRecord {
  id: string
  email: string
  name: string
  role: UserRole
  status: 'ativo' | 'desativado'
  cargo?: string
  orgao?: string
  created?: string
  updated?: string
}

export interface CreateUserPayload {
  email: string
  name: string
  password: string
  passwordConfirm: string
  role: UserRole
  cargo?: string
  orgao?: string
}

/**
 * Lista todos os usuários institucionais do órgão (visível apenas para administradores ou auto-registro)
 */
export async function listInstitucionalUsers(): Promise<ManagedUserRecord[]> {
  const records = await pb.collection('users').getFullList({
    sort: '-created',
  })
  return records.map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name || r.email.split('@')[0],
    role: (r.role as UserRole) || 'operador',
    status: (r.status as 'ativo' | 'desativado') || 'ativo',
    cargo: r.cargo || '',
    orgao: r.orgao || '',
    created: r.created,
    updated: r.updated,
  }))
}

/**
 * Cria uma nova conta individual com papel atribuído (bloqueio de signup público: só admin autenticado pode chamar)
 */
export async function createInstitucionalUser(
  payload: CreateUserPayload,
  adminAuthor: { id: string; email: string; name: string },
): Promise<ManagedUserRecord> {
  if (payload.password !== payload.passwordConfirm) {
    throw new Error('As senhas digitadas não conferem.')
  }
  if (payload.password.length < 8) {
    throw new Error('A senha deve conter no mínimo 8 caracteres.')
  }

  const created = await pb.collection('users').create({
    email: payload.email.trim(),
    password: payload.password,
    passwordConfirm: payload.passwordConfirm,
    name: payload.name.trim(),
    role: payload.role,
    status: 'ativo',
    cargo:
      payload.cargo?.trim() || (payload.role === 'admin' ? 'Gestor Público' : 'Operador Técnico'),
    orgao: payload.orgao?.trim() || 'Prefeitura Municipal',
    emailVisibility: false,
  })

  // Registrar na trilha de auditoria com autoria do admin
  await registerAuditEvent({
    event: 'USER_ACCOUNT_CREATED',
    author: {
      id: adminAuthor.id,
      email: adminAuthor.email,
      name: adminAuthor.name,
      role: 'admin',
    },
    details: {
      target_user_id: created.id,
      target_user_email: created.email,
      target_user_name: created.name,
      target_user_role: payload.role,
      action: 'Criação de conta individual com papel',
    },
    compliance: 'Princípio do Menor Privilégio & Sigilo LC 182/2021',
  })

  return {
    id: created.id,
    email: created.email,
    name: created.name,
    role: (created.role as UserRole) || 'operador',
    status: 'ativo',
    cargo: created.cargo,
    orgao: created.orgao,
    created: created.created,
    updated: created.updated,
  }
}

/**
 * Atualiza dados, papel ou status de uma conta institucional
 */
export async function updateInstitucionalUser(
  userId: string,
  data: {
    name?: string
    role?: UserRole
    status?: 'ativo' | 'desativado'
    cargo?: string
    orgao?: string
    password?: string
    passwordConfirm?: string
  },
  adminAuthor: { id: string; email: string; name: string },
): Promise<ManagedUserRecord> {
  const updateData: any = { ...data }
  if (!updateData.password) {
    delete updateData.password
    delete updateData.passwordConfirm
  }

  const updated = await pb.collection('users').update(userId, updateData)

  // Registrar na trilha de auditoria com autoria
  await registerAuditEvent({
    event: 'USER_ACCOUNT_UPDATED',
    author: {
      id: adminAuthor.id,
      email: adminAuthor.email,
      name: adminAuthor.name,
      role: 'admin',
    },
    details: {
      target_user_id: updated.id,
      target_user_email: updated.email,
      changes: Object.keys(data).filter((k) => k !== 'password' && k !== 'passwordConfirm'),
      new_role: data.role,
      new_status: data.status,
    },
    compliance: 'Trilha de Auditoria com Autoria (Art. 27 LC 182/2021)',
  })

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: (updated.role as UserRole) || 'operador',
    status: (updated.status as 'ativo' | 'desativado') || 'ativo',
    cargo: updated.cargo,
    orgao: updated.orgao,
    created: updated.created,
    updated: updated.updated,
  }
}

/**
 * Desativa ou ativa uma conta institucional
 */
export async function toggleUserStatus(
  user: ManagedUserRecord,
  adminAuthor: { id: string; email: string; name: string },
): Promise<ManagedUserRecord> {
  const newStatus = user.status === 'ativo' ? 'desativado' : 'ativo'
  return await updateInstitucionalUser(user.id, { status: newStatus }, adminAuthor)
}
