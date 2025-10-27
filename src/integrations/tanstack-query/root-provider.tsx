import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认重试策略
      retry: (failureCount, error: any) => {
        // 对于 401 错误不重试（由 axios interceptor 处理）
        if (error?.response?.status === 401) {
          return false;
        }
        // 对于 403, 404 错误也不重试
        if ([403, 404].includes(error?.response?.status)) {
          return false;
        }
        // 对于网络错误，让 axios interceptor 处理，React Query 不重试
        if (!error?.response && error?.message === 'Network Error') {
          return false;
        }
        // 其他错误最多重试 2 次（减少重试次数，因为 axios 也会重试）
        return failureCount < 2;
      },
      // 默认 stale time
      staleTime: 60 * 1000, // 1 minute
      // 默认 gc time (garbage collection time，之前叫 cacheTime)
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      // Mutation 默认不重试
      retry: false,
    },
  },
})

export function getContext() {
  return {
    queryClient,
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
