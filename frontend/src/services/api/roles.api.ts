import type { AxiosError } from 'axios'

import { useQuery } from '@tanstack/vue-query'

import { useAxios } from '@/composables/use-axios'

import type { BackendResponse } from '../types/response.type'

export interface RoleDetail {
  id: number
  name: string
  status: number
  is_filter_scopes: boolean
  remark: string | null
  created_time: string
  updated_time: string | null
}

const ROLES_QUERY_KEY = ['roles']

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code)
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || 'Request failed')
  }
  return response
}

export function useGetAllRolesQuery() {
  const { axiosInstance } = useAxios()

  return useQuery<BackendResponse<RoleDetail[]>, AxiosError>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<RoleDetail[]>>('/sys/roles/all')
      return ensureSuccess(response.data)
    },
  })
}
