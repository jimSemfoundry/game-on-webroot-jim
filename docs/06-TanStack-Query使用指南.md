# TanStack Query (React Query) 使用指南

## 📖 目录

1. [什么是 TanStack Query](#什么是-tanstack-query)
2. [核心概念](#核心概念)
3. [useQuery 使用指南](#usequery-使用指南)
4. [useMutation 使用指南](#usemutation-使用指南)
5. [缓存策略](#缓存策略)
6. [Query Keys 最佳实践](#query-keys-最佳实践)
7. [常见场景示例](#常见场景示例)
8. [最佳实践](#最佳实践)

---

## 什么是 TanStack Query

TanStack Query（前称 React Query）是一个强大的数据获取和状态管理库，专门用于处理服务器状态。

### 🎯 主要优势

- **自动缓存管理** - 智能缓存和后台更新
- **减少样板代码** - 无需手动管理 loading/error 状态
- **自动重试** - 失败请求自动重试
- **数据同步** - 多个组件间自动同步数据
- **性能优化** - 减少不必要的网络请求

---

## 核心概念

### Query（查询）

用于**获取数据**的操作（GET 请求）。

### Mutation（变更）

用于**修改数据**的操作（POST/PUT/DELETE 请求）。

### Query Key

唯一标识一个查询的键，用于缓存管理和数据同步。

### Query Client

管理所有查询和缓存的中心实例。

---

## useQuery 使用指南

### 📌 何时使用 useQuery

✅ **适用场景：**
- 获取数据（GET 请求）
- 需要缓存的数据
- 需要自动重试的请求
- 需要在多个组件间共享的数据

❌ **不适用场景：**
- 提交表单（使用 `useMutation`）
- 修改数据（使用 `useMutation`）
- 不需要缓存的一次性请求

### 🔧 基础用法

```typescript
// src/hooks/api/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: () => authService.getUserProfile(),
    enabled: !!localStorage.getItem("token"),  // 条件启用
    staleTime: 5 * 60 * 1000,  // 5分钟内数据被认为是新鲜的
  });
};
```

### 📋 配置选项详解

#### 1. `queryKey`（必需）

唯一标识查询的键，用于缓存管理。

```typescript
// ✅ 使用常量管理 Query Keys
export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  userBalance: ["auth", "userBalance"] as const,
  cryptoDepositAddress: ["auth", "cryptoDepositAddress"] as const,
};

// ✅ 带参数的 Query Key
export const useCryptoDepositAddress = (network: string) => {
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.cryptoDepositAddress, network],
    queryFn: () => authService.getCryptoDepositAddress(network),
    enabled: !!network,
  });
};
```

#### 2. `queryFn`（必需）

返回 Promise 的函数，执行实际的数据获取。

```typescript
queryFn: () => authService.getUserProfile()
```

#### 3. `enabled`（条件执行）

控制查询是否自动执行。

```typescript
// 只有用户登录时才执行
enabled: !!user

// 只有提供了必需参数时才执行
enabled: !!network && !!currency
```

#### 4. `staleTime`（缓存新鲜度）

数据被认为是"新鲜"的时间。在此期间不会重新请求。

```typescript
// 不同的场景使用不同的 staleTime

// 1. 频繁变化的数据（实时数据）
staleTime: 0,  // 立即过期

// 2. 普通业务数据（30秒）
staleTime: 30 * 1000,

// 3. 用户信息（5分钟）
staleTime: 5 * 60 * 1000,

// 4. 配置数据（30分钟）
staleTime: 30 * 60 * 1000,
```

#### 5. `gcTime`（垃圾回收时间）

旧称 `cacheTime`。未使用的缓存数据保留时间。

```typescript
// 默认值：5分钟
gcTime: 5 * 60 * 1000,

// 实时数据，不保留缓存
gcTime: 0,
```

#### 6. `refetchInterval`（自动刷新）

定时自动重新获取数据。

```typescript
// 每分钟自动刷新余额
export const useUserBalance = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalance,
    queryFn: async () => {
      const { data } = await authService.getUserBalance();
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,  // 每60秒刷新一次
  });
};
```

#### 7. `retry`（重试策略）

请求失败时的重试配置。

```typescript
// 默认重试3次
retry: 3,

// 不重试
retry: false,

// 根据错误类型决定是否重试
retry: (failureCount, error: any) => {
  // 401错误不重试，其他错误最多重试2次
  return error?.response?.status !== 401 && failureCount < 2;
},
```

#### 8. `refetchOnMount` / `refetchOnWindowFocus`

控制何时自动重新获取数据。

```typescript
// 组件挂载时重新获取
refetchOnMount: true,

// 窗口获得焦点时重新获取（默认 true）
refetchOnWindowFocus: false,
```

### 📊 使用返回值

```typescript
const {
  data,           // 查询数据
  isLoading,      // 首次加载中
  isFetching,     // 任何请求进行中（包括后台刷新）
  isError,        // 是否发生错误
  error,          // 错误对象
  refetch,        // 手动重新获取函数
  isSuccess,      // 是否成功
} = useQuery({ /* ... */ });

// 组件中使用
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
if (!data) return null;

return <div>{data.username}</div>;
```

---

## useMutation 使用指南

### 📌 何时使用 useMutation

✅ **适用场景：**
- 创建数据（POST）
- 更新数据（PUT/PATCH）
- 删除数据（DELETE）
- 提交表单
- 需要在成功后刷新相关数据

### 🔧 基础用法

```typescript
// src/hooks/api/useAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useClaimBonusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, currency }: { item: string; currency?: string }) =>
      authService.claimBonus(item, currency),
    
    onSuccess: (data, variables) => {
      // 1. 刷新相关查询缓存
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      
      // 2. 显示成功提示
      toast.success("Bonus claimed successfully!");
    },
    
    onError: (error: any) => {
      // 3. 错误处理
      console.error("Failed to claim bonus:", error);
      toast.error(error.response?.data?.msg || "Failed to claim bonus");
    }
  });
};
```

### 📋 配置选项详解

#### 1. `mutationFn`（必需）

执行变更操作的函数。

```typescript
mutationFn: (variables) => authService.claimBonus(variables)
```

#### 2. `onSuccess`（成功回调）

变更成功后执行。

```typescript
onSuccess: (data, variables, context) => {
  // data: API 返回的数据
  // variables: 传入的参数
  // context: onMutate 返回的上下文
  
  // 刷新相关数据
  queryClient.invalidateQueries({ queryKey: ["users"] });
  
  // 显示提示
  toast.success("操作成功！");
}
```

#### 3. `onError`（错误回调）

变更失败后执行。

```typescript
onError: (error, variables, context) => {
  console.error("操作失败:", error);
  toast.error(error.message);
}
```

#### 4. `onMutate`（乐观更新）

在变更执行前立即调用，用于乐观更新 UI。

```typescript
onMutate: async (newData) => {
  // 取消相关查询，避免覆盖乐观更新
  await queryClient.cancelQueries({ queryKey: ["todos"] });
  
  // 保存当前数据快照
  const previousData = queryClient.getQueryData(["todos"]);
  
  // 乐观更新 UI
  queryClient.setQueryData(["todos"], (old) => [...old, newData]);
  
  // 返回上下文，用于回滚
  return { previousData };
},

onError: (err, newData, context) => {
  // 出错时回滚到之前的数据
  queryClient.setQueryData(["todos"], context.previousData);
}
```

### 📊 使用返回值

```typescript
const {
  mutate,         // 执行 mutation 的函数
  mutateAsync,    // 返回 Promise 的异步版本
  isLoading,      // 是否执行中
  isError,        // 是否发生错误
  isSuccess,      // 是否成功
  data,           // 返回的数据
  error,          // 错误对象
  reset,          // 重置 mutation 状态
} = useMutation({ /* ... */ });

// 在事件处理中使用
const handleClaim = () => {
  mutate({ item: "cashback", currency: "USD" });
};

// 使用 async/await
const handleClaimAsync = async () => {
  try {
    const result = await mutateAsync({ item: "cashback" });
    console.log("成功:", result);
  } catch (error) {
    console.error("失败:", error);
  }
};
```

---

## 缓存策略

### 🎯 项目中的缓存策略示例

#### 1. **长期缓存**（不常变化的配置数据）

```typescript
// 语言列表 - 30分钟缓存
export function useSupportedLanguages() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.languages,
    queryFn: () => publicService.getSupportedLanguages(),
    staleTime: 30 * 60 * 1000,  // 30分钟
    retry: 3,
  });
}

// VIP配置 - 10分钟缓存
export function useVipConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.vipConfig,
    queryFn: () => publicService.getVipConfig(),
    staleTime: 10 * 60 * 1000,  // 10分钟
    retry: 2,
  });
}
```

#### 2. **中期缓存**（普通业务数据）

```typescript
// 用户信息 - 5分钟缓存
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => authService.getUserProfile(),
    enabled: !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000,  // 5分钟
  });
}

// Bonus数据 - 30秒缓存 + 1分钟自动刷新
export const useClaimBonus = (item: "cashback" | "rakeback" | "tournament") => {
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.claimBonus, item],
    queryFn: () => authService.getClaimBonus(item),
    enabled: !!user,
    staleTime: 30 * 1000,        // 30秒
    refetchInterval: 60 * 1000,  // 每分钟自动刷新
  });
};
```

#### 3. **短期缓存**（频繁变化的数据）

```typescript
// 用户余额 - 30秒缓存 + 1分钟自动刷新
export const useUserBalance = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalance,
    queryFn: async () => {
      const { data } = await authService.getUserBalance();
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,        // 30秒
    refetchInterval: 60 * 1000,  // 每分钟刷新
  });
};
```

#### 4. **实时数据**（不缓存）

```typescript
// 最新投注 - 不缓存，每次挂载都刷新
export function useLatestBets() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.latestBets,
    queryFn: () => publicService.getLatestBets(),
    staleTime: 0,                    // 立即过期
    gcTime: 0,                       // 不缓存
    refetchOnMount: true,            // 每次挂载都刷新
    refetchOnWindowFocus: false,     // 窗口聚焦不刷新
    retry: 1,
    networkMode: 'always',
  });
}
```

### 📊 缓存策略对照表

| 数据类型 | staleTime | gcTime | refetchInterval | 示例 |
|---------|-----------|---------|----------------|------|
| 配置数据 | 10-30分钟 | 默认(5分钟) | 不需要 | 语言列表、VIP配置 |
| 用户信息 | 5分钟 | 默认 | 不需要 | 用户资料、设置 |
| 业务数据 | 30秒-2分钟 | 默认 | 1-5分钟 | 余额、Bonus |
| 实时数据 | 0 | 0 | 按需 | 最新投注、排行榜 |

---

## Query Keys 最佳实践

### ✅ 使用常量管理

```typescript
// ✅ 推荐：集中管理 Query Keys
export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  userBalance: ["auth", "userBalance"] as const,
  cryptoDepositAddress: ["auth", "cryptoDepositAddress"] as const,
  // ...
} as const;

export const PUBLIC_QUERY_KEYS = {
  languages: ['public', 'languages'] as const,
  gameProviders: ['public', 'gameProviders'] as const,
  // ...
} as const;
```

### ✅ Query Key 结构规范

```typescript
// 1. 基础查询（无参数）
["auth", "currentUser"]

// 2. 带参数的查询
["auth", "cryptoDepositAddress", network]
["auth", "claimBonus", "cashback"]

// 3. 列表查询
["public", "casinoGameList", { page: 1, provider: "pragmatic" }]

// 4. 详情查询
["game", "detail", gameId]
```

### ✅ Query Key 层级设计

```typescript
// 层级结构：[domain, feature, ...params]

// 认证相关
["auth", "currentUser"]
["auth", "userBalance"]

// 公共数据
["public", "languages"]
["public", "gameProviders"]

// 游戏相关
["game", "list", filters]
["game", "detail", gameId]
```

---

## 常见场景示例

### 场景 1：登录后刷新用户数据

```typescript
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.signIn(credentials),
    onSuccess: (data) => {
      // 1. 保存 token
      localStorage.setItem("token", data.data.token);
      
      // 2. 设置用户数据到缓存
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data);
      
      // 3. 触发重新获取（确保最新数据）
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      
      // 4. 显示提示
      toast.success("登录成功！");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
```

### 场景 2：领取奖励后刷新多个相关数据

```typescript
export const useClaimBonusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, currency }: { item: string; currency?: string }) =>
      authService.claimBonus(item, currency),
    
    onSuccess: (_, variables) => {
      // 刷新所有相关的查询
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.claimBonus });

      // 特殊处理：日历奖励
      if (variables.item === "calendar") {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.calendarBonus });
      }
      
      toast.success("Bonus claimed successfully!");
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "Failed to claim bonus");
    }
  });
};
```

### 场景 3：条件查询（依赖其他数据）

```typescript
// 只有用户登录且提供了网络参数时才执行查询
export const useCryptoDepositAddress = (network: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.cryptoDepositAddress, network],
    queryFn: () => authService.getCryptoDepositAddress(network),
    enabled: !!user && !!network,  // 两个条件都满足才执行
  });
};
```

### 场景 4：数据转换（select）

```typescript
// 获取成就列表并进行数据转换
export const useMyAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.myAchievements,
    queryFn: () => authService.getMyAchievements(),
    enabled: !!user,
    staleTime: 60 * 1000,
    
    // 使用 select 转换数据
    select: (data) => {
      if (!data?.data || !Array.isArray(data.data)) {
        return { achievements: [], inProgress: [], completed: [] };
      }
      
      const achievements = data.data;
      const inProgress = achievements.filter(a => !a.completed);
      const completed = achievements.filter(a => a.completed);
      
      return {
        achievements,
        inProgress,
        completed
      };
    }
  });
};
```

### 场景 5：乐观更新（喜欢游戏）

```typescript
export const useLikeGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => authService.likeGame(gameId),
    
    // 乐观更新：立即更新 UI
    onMutate: async (gameId) => {
      // 取消相关查询避免覆盖
      await queryClient.cancelQueries({ queryKey: ["favoriteGames"] });
      
      // 保存快照
      const previousGames = queryClient.getQueryData(["favoriteGames"]);
      
      // 立即更新 UI
      queryClient.setQueryData(["favoriteGames"], (old: any[]) => {
        const isLiked = old.some(g => g.id === gameId);
        if (isLiked) {
          return old.filter(g => g.id !== gameId);
        } else {
          return [...old, { id: gameId }];
        }
      });
      
      return { previousGames };
    },
    
    // 成功后显示提示
    onSuccess: (response) => {
      if (response.data.action === "added") {
        toast.success("Game added to favorites! ❤️");
      } else {
        toast.success("Game removed from favorites");
      }
    },
    
    // 失败时回滚
    onError: (err, gameId, context) => {
      queryClient.setQueryData(["favoriteGames"], context.previousGames);
      toast.error("Failed to update favorite status");
    },
    
    // 最终都重新获取确保数据正确
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteGames"] });
    }
  });
};
```

---

## 缓存刷新方法对比

### 1. `invalidateQueries`（推荐）

**标记查询为过期，下次使用时自动重新获取。**

```typescript
// 刷新单个查询
queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });

// 刷新所有匹配的查询
queryClient.invalidateQueries({ queryKey: ["auth"] });  // 刷新所有 auth 相关
```

**适用场景：**
- ✅ 大多数情况的首选方法
- ✅ 数据可能已变化
- ✅ 让 React Query 智能决定何时重新获取

### 2. `refetchQueries`（立即刷新）

**立即重新获取数据，不管是否过期。**

```typescript
// 立即重新获取
await queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
```

**适用场景：**
- 需要立即获取最新数据
- 用户明确触发刷新操作

### 3. `setQueryData`（手动设置）

**直接设置缓存数据，不发起请求。**

```typescript
// 直接更新缓存
queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, newUserData);
```

**适用场景：**
- 乐观更新
- 从其他 API 获取的数据
- 避免重复请求

### 4. `removeQueries`（删除缓存）

**完全删除查询缓存。**

```typescript
// 删除缓存
queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
```

**适用场景：**
- 用户登出
- 需要强制重新获取

---

## 最佳实践

### ✅ DO（推荐做法）

#### 1. 集中管理 Query Keys

```typescript
// ✅ 使用常量
export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
};

// ❌ 避免硬编码
useQuery({ queryKey: ["auth", "currentUser"] })
```

#### 2. 合理设置缓存时间

```typescript
// ✅ 根据数据特性设置
// 配置数据：长缓存
staleTime: 30 * 60 * 1000,

// 用户数据：中等缓存
staleTime: 5 * 60 * 1000,

// 实时数据：不缓存
staleTime: 0,
```

#### 3. 使用 enabled 控制查询

```typescript
// ✅ 只在必要时执行
enabled: !!user && !!network
```

#### 4. Mutation 后刷新相关数据

```typescript
// ✅ 刷新所有相关查询
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
}
```

#### 5. 统一错误处理

```typescript
// ✅ 在 mutation 中统一处理错误
onError: (error: any) => {
  console.error("Failed:", error);
  toast.error(error.response?.data?.msg || "Operation failed");
}
```

#### 6. 使用 TypeScript

```typescript
// ✅ 定义类型
interface UserBalance {
  amount: number;
  currency: string;
}

useQuery<UserBalance>({
  queryKey: AUTH_QUERY_KEYS.userBalance,
  queryFn: () => authService.getUserBalance(),
});
```

### ❌ DON'T（避免的做法）

#### 1. 避免过度缓存

```typescript
// ❌ 实时数据使用长缓存
staleTime: Infinity,  // 永不过期

// ✅ 实时数据应该短缓存或不缓存
staleTime: 0,
```

#### 2. 避免忘记刷新缓存

```typescript
// ❌ Mutation 后不刷新相关数据
onSuccess: () => {
  toast.success("Success!");
  // 忘记刷新相关查询
}

// ✅ 刷新所有相关查询
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["users"] });
  toast.success("Success!");
}
```

#### 3. 避免在循环中使用 hooks

```typescript
// ❌ 在循环中调用 hooks
items.map(item => {
  const { data } = useQuery({ ... });  // 错误！
});

// ✅ 使用单个查询获取所有数据
const { data } = useQuery({
  queryKey: ["items"],
  queryFn: () => fetchAllItems(),
});
```

#### 4. 避免同步等待异步操作

```typescript
// ❌ 不要这样使用
const { data } = await useQuery({ ... });  // 错误！

// ✅ 使用返回的数据
const { data, isLoading } = useQuery({ ... });
if (isLoading) return <Loading />;
```

---

## 调试技巧

### 1. 启用 DevTools

```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 2. 查看缓存状态

```typescript
// 获取查询状态
const state = queryClient.getQueryState(AUTH_QUERY_KEYS.currentUser);
console.log(state);

// 获取查询数据
const data = queryClient.getQueryData(AUTH_QUERY_KEYS.currentUser);
console.log(data);
```

### 3. 日志记录

```typescript
onSuccess: (data) => {
  console.log("Query succeeded:", data);
},
onError: (error) => {
  console.error("Query failed:", error);
},
```

---

## 参考资源

- [TanStack Query 官方文档](https://tanstack.com/query/latest/docs/react/overview)
- [项目中的实际示例](../src/hooks/api/)
  - `useAuth.ts` - 认证相关查询和变更
  - `usePublic.ts` - 公共数据查询
- [Query Keys 最佳实践](https://tkdodo.eu/blog/effective-react-query-keys)

---

## 总结

### 🎯 核心原则

1. **useQuery** 用于获取数据
2. **useMutation** 用于修改数据
3. **合理设置缓存** 根据数据特性选择 staleTime
4. **及时刷新** Mutation 后刷新相关查询
5. **集中管理** 使用常量管理 Query Keys
6. **条件执行** 使用 enabled 控制查询时机

### 📝 快速检查清单

- [ ] Query Keys 使用常量管理？
- [ ] staleTime 根据数据特性设置？
- [ ] enabled 条件正确设置？
- [ ] Mutation 成功后刷新相关查询？
- [ ] 错误处理完善？
- [ ] 用户反馈（loading/error/success）？

遵循这些最佳实践，可以构建高性能、易维护的数据管理层！🚀
