import type { AxiosError } from 'axios'

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAxios } from '@/composables/use-axios'

import type { BackendResponse } from '../types/response.type'

export interface DataRuleDetail {
  id: number
  name: string
  model: string
  column: string
  operator: string
  expression: string
  value: string
  created_time: string
  updated_time: string | null
}

export interface DataRuleColumnDetail {
  key: string
  comment: string | null
}

export interface DataRuleParams {
  name?: string
}

export interface DataRulePayload {
  name: string
  model: string
  column: string
  operator: string
  expression: string
  value: string
}

const DATA_RULE_QUERY_KEY = ['data-rule']
const DATA_RULE_MODELS_QUERY_KEY = ['data-rule-models']

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code)
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || 'Request failed')
  }
  return response
}

export function useGetDataRulesQuery(params?: MaybeRefOrGetter<DataRuleParams | undefined>) {
  const { axiosInstance } = useAxios()
  const resolvedParams = computed(() => toValue(params) ?? {})

  return useQuery<BackendResponse<DataRuleDetail[]>, AxiosError>({
    queryKey: computed(() => [...DATA_RULE_QUERY_KEY, 'all', resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<DataRuleDetail[]>>(
        '/sys/data-rules/all',
        {
          params: resolvedParams.value,
        },
      )
      return ensureSuccess(response.data)
    },
  })
}

export function useGetDataRuleModelsQuery() {
  const { axiosInstance } = useAxios()

  return useQuery<BackendResponse<string[]>, AxiosError>({
    queryKey: DATA_RULE_MODELS_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<string[]>>('/sys/data-rules/models')
      return ensureSuccess(response.data)
    },
  })
}

export function useGetDataRuleModelColumnsQuery(model: MaybeRefOrGetter<string>) {
  const { axiosInstance } = useAxios()
  const resolvedModel = computed(() => toValue(model))

  return useQuery<BackendResponse<DataRuleColumnDetail[]>, AxiosError>({
    queryKey: computed(() => [...DATA_RULE_MODELS_QUERY_KEY, 'columns', resolvedModel.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<DataRuleColumnDetail[]>>(
        `/sys/data-rules/models/${resolvedModel.value}/columns`,
      )
      return ensureSuccess(response.data)
    },
    enabled: computed(() => resolvedModel.value.length > 0),
  })
}

export function useCreateDataRuleMutation() {
  const { axiosInstance } = useAxios()
  const queryClient = useQueryClient()

  return useMutation<BackendResponse<null>, AxiosError, DataRulePayload>({
    mutationKey: ['create-data-rule'],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>('/sys/data-rules', payload)
      return ensureSuccess(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_RULE_QUERY_KEY })
    },
  })
}

export function useUpdateDataRuleMutation() {
  const { axiosInstance } = useAxios()
  const queryClient = useQueryClient()

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: DataRulePayload }>({
    mutationKey: ['update-data-rule'],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/data-rules/${id}`,
        payload,
      )
      return ensureSuccess(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_RULE_QUERY_KEY })
    },
  })
}

export function useDeleteDataRuleMutation() {
  const { axiosInstance } = useAxios()
  const queryClient = useQueryClient()

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ['delete-data-rule'],
    mutationFn: async (ids) => {
      const response = await axiosInstance.delete<BackendResponse<null>>('/sys/data-rules', {
        data: { pks: ids },
      })
      return ensureSuccess(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_RULE_QUERY_KEY })
    },
  })
}
