import pb from '@/lib/pocketbase/client'

export const createRequisicao = (data: any) => pb.collection('requisicoes_ciot').create(data)

export const updateRequisicao = (id: string, data: Partial<any>) =>
  pb.collection('requisicoes_ciot').update(id, data)

export const createLog = (data: any) => pb.collection('logs_requisicoes').create(data)

export const getRequisicoes = () =>
  pb.collection('requisicoes_ciot').getList(1, 50, { sort: '-created' })
