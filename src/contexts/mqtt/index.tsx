import mqtt from "mqtt";
import { useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import {
  IClientPublishOptions,
  IClientSubscribeOptions,
  IClientUnsubscribeProperties,
  ISubscriptionMap
} from "mqtt/lib/client";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import {
  extractId,
  hash32,
  initProps,
  MQTT_MESSAGE_STORE_MAX_PER_TOPIC,
  mqtt_options,
  MqttContext,
  MqttMessage,
  Props,
  RECENT_DEDUP_MAX_KEYS,
  shouldStoreMessageForTopic,
  TyMqttClient
} from "@/contexts/mqtt/interface.tsx";

export const MqttServiceProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<TyMqttClient>(null);
  const recentDedupKeysRef = useRef<Map<string, { order: string[]; set: Set<string> }>>(new Map());
  const pendingSubscriptionsRef = useRef<Map<string, IClientSubscribeOptions | undefined>>(new Map());

  const [service, setService] = useState<Props>(initProps);

  // 基础配置信息
  const { data: baseConf } = useBaseConfig();

  // 将订阅请求暂存到 pending 队列中（用于未连接时的兜底订阅）
  // - topic 支持 string / string[] / ISubscriptionMap
  // - 当传入 ISubscriptionMap 时，map value 可能是 boolean：
  //   - false: 跳过该 topic
  //   - true: 订阅该 topic（使用默认订阅参数）
  //   - object: 使用该 topic 对应的订阅参数
  const queuePendingSubscribe = useCallback((topic: string | string[] | ISubscriptionMap, opts?: IClientSubscribeOptions) => {
    if (typeof topic === "string") {
      pendingSubscriptionsRef.current.set(topic, opts);
      return;
    }

    if (Array.isArray(topic)) {
      for (const t of topic) pendingSubscriptionsRef.current.set(t, opts);
      return;
    }

    for (const [t, o] of Object.entries(topic)) {
      if (o === false) continue;
      pendingSubscriptionsRef.current.set(t, o === true ? undefined : o);
    }
  }, []);

  // 将 pending 队列中的订阅请求一次性 flush 到 mqttClient.subscribe
  // - 触发时机: connect 成功后调用（handleConnect）
  // - 为了保证类型与默认行为，flush 时会给每个 topic 补默认 qos=0，然后再合并 opts
  // - 会打印本次 flush 的 topics，便于排查未连接期间积压的订阅
  const flushPendingSubscriptions = useCallback(() => {
    const mqttClient = clientRef.current;
    if (!mqttClient) return;

    const pending = pendingSubscriptionsRef.current;

    if (pending.size === 0) return;

    const topics = Array.from(pending.keys());

    const subscriptionMap: ISubscriptionMap = {};
    for (const [topic, opts] of pending.entries()) {
      subscriptionMap[topic] = ({ qos: 0, ...(opts ?? {}) } as unknown) as IClientSubscribeOptions;
    }

    pendingSubscriptionsRef.current = new Map();

    mqttClient.subscribe(subscriptionMap, (err) => {
      if (err) {
        // console.error("Subscription failed for pending topics:", topics, err);
      } else {
        console.info('WSS', topics?.join(" | "), "✅");
      }
    });
  }, []);

  // 连接成功处理：更新 connected 状态
  const handleConnect = useCallback(() => {
    // console.log("wss connected 🆗");
    setService((v) => ({ ...v, connected: true }));
    flushPendingSubscriptions();
  }, [flushPendingSubscriptions]);

  /**
   * 处理订阅到的消息
   *
   * 1. MQTT 有时会收到重复数据
   *    a. 断线重连后的重放 / Retained / Session 行为
   *    b. QoS1 的“至少一次”语义
   *    c. 客户端重复订阅 / 多实例监听
   *
   * 2. 实际工程建议（无论原因都建议做）
   *    a. 前端必须做幂等/去重：MQTT 在 QoS1/重连下无法保证 exactly-once。
   *    b. 数据去重优先用
   */
  const handleMessages = useCallback((_topic: string, _message: any) => {
    const msgStr = _message.toString();

    // 有些 topic 不需要存储到 Context（例如高频 topic），这里直接跳过存储逻辑
    if (!shouldStoreMessageForTopic(_topic)) return;

    // 数据去重复 id / hash
    const incomingId = extractId(msgStr);

    const dedupKey = incomingId != null
      ? `id:${String(incomingId)}`
      : `hash:${hash32(msgStr)}:${msgStr.length}`;
    // _topic === 'public/order/greatest' && console.info(dedupKey);
    const bucket = recentDedupKeysRef.current.get(_topic) ?? { order: [], set: new Set<string>() };

    if (bucket.set.has(dedupKey)) return;

    bucket.set.add(dedupKey);
    bucket.order.unshift(dedupKey);

    while (bucket.order.length > RECENT_DEDUP_MAX_KEYS) {
      const removed = bucket.order.pop();
      if (removed) bucket.set.delete(removed);
    }

    recentDedupKeysRef.current.set(_topic, bucket);

    const message: MqttMessage = {
      topic: _topic,
      payload: msgStr,
      timestamp: Date.now()
    };

    // 存储消息到Context中
    setService((v) => {
      const newMessages = new Map(v.messages);

      const prevList = newMessages.get(_topic) || [];
      newMessages.set(_topic, [message, ...prevList].slice(0, MQTT_MESSAGE_STORE_MAX_PER_TOPIC));

      return { ...v, messages: newMessages };
    });

    // debug code
    // try {
    //   const data = JSON.parse(msgStr);
    //   console.info("Parsed data:", data);
    // } catch {
    //   console.warn("Non-JSON format:", msgStr);
    // }
  }, []);

  // 错误和关闭
  const handleDisconnect = useCallback((_err?: any) => {
    // console.log("wss connect [error | close] ❌", err);
    setService((v) => ({ ...v, connected: false }));
  }, []);

  useEffect(() => {
    // t110774 §3.2 / PR2: 把 wss 连接推迟到首屏渲染完毕后的浏览器空闲期再发起，
    // 避免冷启动期间 TLS 握手 + EMQX auth 阻塞 paint。Safari 16- 没有 rIC，fallback setTimeout(200ms)。
    let idleCancel: (() => void) | null = null;

    if (!clientRef.current && baseConf?.data?.emqx_r_host && baseConf?.data?.emqx_r_pass && baseConf?.data?.emqx_r_user) {
      const startConnect = () => {
        // 重入保护：effect 卸载或被新一轮 idleCallback 抢跑时跳过
        if (clientRef.current) return;

        const mqttClient = mqtt.connect(`wss://${baseConf?.data?.emqx_r_host}/mqtt`, {
          ...mqtt_options,
          username: baseConf?.data?.emqx_r_user,
          password: baseConf?.data?.emqx_r_pass
        });

        clientRef.current = mqttClient;

        setService((v) => ({ ...v, client: mqttClient }));

        mqttClient.on("error", (err) => {
          handleDisconnect(err);
        });
        mqttClient.on("close", handleDisconnect);
        mqttClient.on("connect", handleConnect);
        mqttClient.on("message", handleMessages);
      };

      type RICWindow = Window & {
        requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout?: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      const w = window as RICWindow;

      if (typeof w.requestIdleCallback === "function") {
        // timeout: 2000 兜底——极慢机器上若 idle 一直没空，2s 后强制跑
        const handle = w.requestIdleCallback(() => startConnect(), { timeout: 2000 });
        idleCancel = () => w.cancelIdleCallback?.(handle);
      } else {
        const handle = window.setTimeout(startConnect, 200);
        idleCancel = () => window.clearTimeout(handle);
      }
    }

    // 组件卸载时断开连接
    return () => {
      // 1. 如果连接还没开始（idle 等待中），取消 idle 回调
      idleCancel?.();
      idleCancel = null;

      // 2. 如果连接已建立，按原逻辑清理
      if (clientRef.current) {
        pendingSubscriptionsRef.current = new Map();

        clientRef.current.off("error", handleDisconnect);
        clientRef.current.off("close", handleDisconnect);
        clientRef.current.off("connect", handleConnect);
        clientRef.current.off("message", handleMessages);

        clientRef.current.end();
        clientRef.current = null;

        setService(initProps);
      }
    };
  }, [
    baseConf?.data?.emqx_r_host,
    baseConf?.data?.emqx_r_pass,
    baseConf?.data?.emqx_r_user
  ]);

  // 发布消息（opts.qos: 0/1/2，可靠性越高开销越大；opts.retain: 是否保留消息）
  const publish = useCallback((topic: string, message: string, opts?: IClientPublishOptions) => {
    if (clientRef.current && service.connected) {
      clientRef.current.publish(topic, message, opts, (err) => {
        if (err) {
          // TODO: sentry.io 错误上报
          console.error("Failed to publish message:", err);
        } else {
          // console.info(`Successfully published message to topic: ${topic}`, message);
        }
      });
    }
  }, [service.connected]);

  // 订阅消息（opts.qos: 0/1/2，决定订阅侧接收消息的 QoS 上限）
  const subscribe = useCallback((topic: string | string[] | ISubscriptionMap, opts?: IClientSubscribeOptions) => {
    if (!clientRef.current || !service.connected) {
      queuePendingSubscribe(topic, opts);
      return;
    }

    clientRef.current.subscribe(topic, opts, (err) => {
      if (err) {
        // TODO: sentry.io 错误上报
        // console.error(topic, "✖️");
      } else {
        // typeof topic === "object" ? console.info(topic) : console.info(topic, "🆗");
      }
    });
  }, [queuePendingSubscribe, service.connected]);

  // 取消订阅
  const unsubscribe = useCallback((topic: string | string[], opts?: IClientUnsubscribeProperties) => {
    if (!clientRef.current || !service.connected) {
      const removeTopics = Array.isArray(topic) ? topic : [topic];
      for (const t of removeTopics) pendingSubscriptionsRef.current.delete(t);
      return;
    }

    clientRef.current.unsubscribe(topic, opts, (err) => {
      if (err) {
        // TODO: sentry.io 错误上报
        // console.error(`Unsubscription failed for topic ${topic}:`, err);
      } else {
        // console.info(`Successfully unsubscribed from topic: ${topic}`);
      }
    });
  }, [service.connected]);

  // 获取指定主题的消息
  const getMessages = useCallback((topic: string): MqttMessage[] => {
    return service.messages.get(topic) || [];
  }, [service.messages]);

  // 清空消息
  const clearMessages = useCallback((topic?: string) => {
    setService((v) => {
      const newMessages = new Map(v.messages);
      if (topic) {
        newMessages.delete(topic);
      } else {
        newMessages.clear();
      }
      return { ...v, messages: newMessages };
    });
  }, []);

  return (
    <MqttContext.Provider
      value={{
        client: service.client,
        publish,
        connected: service.connected,
        subscribe,
        unsubscribe,
        messages: service.messages,
        getMessages,
        clearMessages
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqttService = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error("useMqttService must be used within a MqttProvider");
  }
  return context;
};

export const useMqttTopicMessages = <TParsed = unknown>(
  topic: string | null | undefined,
  opts?: IClientSubscribeOptions,
  parser?: (payload: string) => TParsed
) => {
  const { subscribe, unsubscribe, getMessages } = useMqttService();

  useEffect(() => {
    if (!topic) return;
    subscribe(topic, opts);
    return () => {
      unsubscribe(topic);
    };
  }, [opts, subscribe, topic, unsubscribe]);

  const messages = useMemo(() => {
    if (!topic) return [];
    return getMessages(topic);
  }, [getMessages, topic]);

  const parsedMessages = useMemo(() => {
    const effectiveParser: (payload: string) => TParsed = (parser ?? (JSON.parse as unknown as (payload: string) => TParsed));
    return messages.map((msg) => {
      try {
        return { ...msg, parsed: effectiveParser(msg.payload) };
      } catch {
        return { ...msg, parsed: undefined };
      }
    });
  }, [messages, parser]);

  return { parsedMessages };
};

// 单点订阅、多点消费
export const useMqttTopicMessagesReadonly = <TParsed = unknown>(
  topic: string | null | undefined,
  parser?: (payload: string) => TParsed
) => {
  const { getMessages } = useMqttService();

  const messages = useMemo(() => {
    if (!topic) return [];
    return getMessages(topic);
  }, [getMessages, topic]);

  const parsedMessages = useMemo(() => {
    const effectiveParser: (payload: string) => TParsed = (parser ?? (JSON.parse as unknown as (payload: string) => TParsed));
    return messages.map((msg) => {
      try {
        return { ...msg, parsed: effectiveParser(msg.payload) };
      } catch {
        return { ...msg, parsed: undefined };
      }
    });
  }, [messages, parser]);

  return { parsedMessages };
};

/**
 * 多个组件/业务同时订阅同一个 topic
 * 如果 A、B 两个地方都 subscribe('t')
 * 其中一个组件卸载时调用 unsubscribe('t')
 * 另一个组件还在使用这个 topic
 * 在 MQTT 协议层面通常是“客户端对 topic 的订阅状态”，不是“按组件计数”的——这时你很难做到既不影响 B 又让 A 完全“清理干净”

 推荐用法:
 顶层集中订阅（唯一订阅点）一个更靠上的组件里统一订阅
 const topic = xxx ? `xxx/xxx/xxx` : null;
 useMqttTopicMessages(topic, { qos: 1 }); // 这里只负责订阅即可

 业务组件只读消费（不订阅）
 const topic = xxx ? `xxx/xxx/xxx` : null;
 const { parsedLatest } = useMqttTopicMessagesReadonly(topic);
 */